/**
 * AI Service
 * Google Gemini integration: text-to-Markdown conversion and HTML/JSON syntax fixing
 */

const PROMPT_TEMPLATE = `You are an expert Markdown formatter. Your task is to convert plain text into well-structured, professional Markdown.

CRITICAL RULES:
1. Output ONLY valid Markdown - no explanations, no comments, no extra text
2. Preserve ALL original content and meaning
3. Use proper Markdown syntax throughout

FORMATTING GUIDELINES:
- Headings: Use # for main title, ## for sections, ### for subsections
- Lists: Use - for unordered lists, 1. 2. 3. for ordered lists
- Bold: **important text** for emphasis
- Italic: *text* for subtle emphasis
- Code: \`inline code\` for short snippets, \`\`\`language for code blocks
- Links: [text](url) format
- Tables: Use | for columns when data is tabular
- Blockquotes: > for quotes or callouts

EXAMPLES:
Plain: "Introduction This is about markdown"
Markdown: "# Introduction\n\nThis is about markdown"

Plain: "Step 1 Do this Step 2 Do that"
Markdown: "1. Do this\n2. Do that"

Plain: "Important note: Remember this"
Markdown: "> **Important note:** Remember this"

INPUT TEXT TO CONVERT:
"""
{{USER_TEXT}}
"""

MARKDOWN OUTPUT (no explanations, just Markdown):`;

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/** Model preselected when the user has not chosen one (used only if present in the live list) */
export const PREFERRED_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Fetch the models available to this API key that support text generation.
 * Doubles as API key validation: an invalid key makes the request fail.
 * @param {string} apiKey - Gemini API key
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array<{id: string, name: string, description: string}>>}
 */
export async function listGeminiModels(apiKey, signal) {
    if (!apiKey) {
        throw new Error('Gemini API key is required');
    }

    const models = [];
    let pageToken = '';

    do {
        const url = `${GEMINI_BASE_URL}/models?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
        const response = await fetch(url, {
            headers: { 'x-goog-api-key': apiKey },
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        for (const m of data.models || []) {
            if (!m.supportedGenerationMethods?.includes('generateContent')) continue;
            const id = m.name.replace(/^models\//, '');
            models.push({
                id,
                name: m.displayName || id,
                description: m.description || '',
            });
        }
        pageToken = data.nextPageToken || '';
    } while (pageToken);

    return models;
}

/**
 * Send a prompt to a Gemini model and return the response text
 * @param {string} prompt - Full prompt text
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model id, e.g. 'gemini-2.5-flash'
 * @param {object} generationConfig - Gemini generation settings
 * @returns {Promise<string>} - Trimmed response text
 */
async function generateWithGemini(prompt, apiKey, model, generationConfig) {
    if (!apiKey) {
        throw new Error('Gemini API key is required');
    }
    if (!model) {
        throw new Error('No Gemini model selected. Choose one in AI Settings.');
    }

    const response = await fetch(
        `${GEMINI_BASE_URL}/models/${encodeURIComponent(model)}:generateContent`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig,
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;

        if (response.status === 503) {
            throw new Error('Gemini is busy right now. Please wait 10-30 seconds and try again.');
        }
        if (response.status === 429) {
            throw new Error('Rate limit or quota exceeded. Please wait a moment and try again.');
        }
        if (response.status === 400 && /API key/i.test(errorMessage)) {
            throw new Error('Invalid Gemini API key. Please check your key in Settings.');
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('Invalid response from Gemini API');
    }
    if (candidate.finishReason === 'MAX_TOKENS') {
        // Never hand back a cut-off result that would overwrite the user's content
        throw new Error('The AI reply was cut off because the content is too long. Try a smaller section or another model.');
    }

    return text.trim();
}

/**
 * Remove a surrounding ``` code fence if the model added one
 * @param {string} text - Model output
 * @param {string} lang - Language tag(s) to accept, as a regex source (e.g. 'html')
 */
function stripCodeFence(text, lang) {
    if (!text.startsWith('```')) return text;
    return text
        .replace(new RegExp('^```(?:' + lang + ')?\\n'), '')
        .replace(/\n```$/, '')
        .trim();
}

/**
 * Convert text to Markdown using Gemini
 * @param {string} text - Plain text to convert
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Gemini model id
 * @returns {Promise<string>} - Converted Markdown
 */
export async function convertToMarkdown(text, apiKey, model) {
    if (!text || !text.trim()) {
        throw new Error('Input text is empty');
    }

    const prompt = PROMPT_TEMPLATE.replace('{{USER_TEXT}}', text);
    const result = await generateWithGemini(prompt, apiKey, model, {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    });

    return stripCodeFence(result, 'markdown|md');
}

/**
 * Fix syntax errors across the HTML, CSS and JavaScript tabs using Gemini.
 * The model receives all three together so it understands how they relate
 * (ids/classes used by the CSS and JS, elements the JS expects, etc.).
 * @param {{html: string, css: string, js: string}} code - Contents of each tab
 * @returns {Promise<{html: string, css: string, js: string}>} - Fixed contents of each tab
 */
export async function fixHTML({ html = '', css = '', js = '' }, apiKey, model) {
    if (!html.trim() && !css.trim() && !js.trim()) {
        throw new Error('Input HTML is empty');
    }

    const prompt = `You are an expert web developer fixing syntax errors in a small web page made of three files: HTML, CSS and JavaScript.

The three files belong together: the CSS styles the HTML, and the JavaScript runs inside the same page and works with its elements (by id, class, selector). Read ALL three before changing anything, and use each one as context for the others.

CRITICAL RULES:
1. Fix ONLY syntax errors, in ANY of the three files:
   - HTML: unclosed tags, improperly nested tags, missing quotes around attribute values, invalid syntax
   - CSS: missing semicolons, braces or colons, malformed selectors, unclosed comments or strings
   - JavaScript: missing brackets, parentheses, quotes or commas, unclosed strings or template literals, other syntax errors
2. Do NOT rename, remove, restructure or rewrite anything that already works. Keep every id, class, selector, function and variable name exactly as written, so the three files keep working together.
3. If a file is empty, keep it empty. Do not invent code.
4. Keep <!DOCTYPE>, <html>, <head>, <body>, <link> and <script src> tags in the HTML file exactly as written. Do NOT move CSS or JavaScript into the HTML file; each file's code goes in its own section.
5. Use 2-space indentation.
6. Output EXACTLY the three sections below, with these marker lines on their own line, and nothing else - no explanations, no markdown code fences. Output the COMPLETE content of each file, never a summary or a partial diff.

${FIX_MARKERS.html}
(complete fixed HTML)
${FIX_MARKERS.css}
(complete fixed CSS)
${FIX_MARKERS.js}
(complete fixed JavaScript)

Here are the files to fix.

${FIX_MARKERS.html}
${html}
${FIX_MARKERS.css}
${css}
${FIX_MARKERS.js}
${js}
${FIX_MARKERS.end}`;

    try {
        const result = await generateWithGemini(prompt, apiKey, model, {
            temperature: 0.1,
            maxOutputTokens: 8192,
        });
        return parseFixSections(result);
    } catch (error) {
        throw new Error(`Failed to fix HTML: ${error.message}`);
    }
}

const FIX_MARKERS = {
    html: '=====HTML=====',
    css: '=====CSS=====',
    js: '=====JS=====',
    end: '=====END=====',
};

/**
 * Split the model's labelled reply back into the three files
 * @param {string} text - Model output containing the marker lines
 */
function parseFixSections(text) {
    const positions = ['html', 'css', 'js'].map((key) => ({
        key,
        at: text.indexOf(FIX_MARKERS[key]),
    }));

    if (positions.some((p) => p.at === -1) || !(positions[0].at < positions[1].at && positions[1].at < positions[2].at)) {
        throw new Error('The AI reply was not in the expected format. Please try again.');
    }

    const endAt = text.indexOf(FIX_MARKERS.end, positions[2].at);
    const sections = {};
    positions.forEach((p, i) => {
        const start = p.at + FIX_MARKERS[p.key].length;
        const end = i < 2 ? positions[i + 1].at : endAt === -1 ? text.length : endAt;
        // Each section may still be wrapped in a code fence
        sections[p.key] = stripCodeFence(text.slice(start, end).trim(), 'html|css|javascript|js');
    });

    return sections;
}

/**
 * Fix JSON syntax errors using Gemini
 */
export async function fixJSON(json, apiKey, model) {
    if (!json || !json.trim()) {
        throw new Error('Input JSON is empty');
    }

    const prompt = `You are an expert JSON syntax fixer. Your task is to fix any JSON syntax errors and format the code properly.

CRITICAL RULES:
1. Output ONLY valid JSON - no explanations, no comments, no markdown code blocks
2. Fix all syntax errors (missing/extra commas, quotes, brackets, etc.)
3. Format with proper indentation (2 spaces)
4. Preserve all data and structure
5. Convert single quotes to double quotes
6. Remove trailing commas
7. Quote all keys

INPUT JSON WITH POSSIBLE ERRORS:
"""
${json}
"""

FIXED JSON OUTPUT (no explanations, just the corrected JSON):`;

    try {
        const result = stripCodeFence(
            await generateWithGemini(prompt, apiKey, model, {
                temperature: 0.1,
                maxOutputTokens: 8192,
            }),
            'json'
        );

        // Validate that the result is actually valid JSON
        try {
            JSON.parse(result);
        } catch {
            throw new Error('AI returned invalid JSON. Please check your input.');
        }

        return result;
    } catch (error) {
        throw new Error(`Failed to fix JSON: ${error.message}`);
    }
}
