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

const MERMAID_RULES = `MERMAID RULES:
- Output ONLY Mermaid code: no explanations, no markdown code fences, no comments about what you changed
- Use Mermaid v11 syntax and start with a valid diagram type (flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, pie, mindmap, journey, gitGraph, ...)
- Wrap node/edge labels in double quotes when they contain special characters such as ( ) [ ] { } : ; , # or quotes
- Do not use the reserved word "end" in lowercase as a node id or label; write it as "End" or quote it
- Use 4-space indentation`;

/**
 * Fix Mermaid syntax errors using Gemini
 * @param {string} code - Mermaid source
 * @param {string} errorMessage - The parser error for this source (helps the model locate the problem)
 */
export async function fixMermaid(code, errorMessage, apiKey, model) {
    if (!code || !code.trim()) {
        throw new Error('Input Mermaid is empty');
    }

    const prompt = `You are an expert at Mermaid diagram syntax. Fix the syntax errors in the diagram below so it renders correctly.

${MERMAID_RULES}

CRITICAL RULES:
1. Keep the same diagram type, nodes, relationships and meaning. Change only what is needed to make it valid.
2. Do not add new content or remove existing content.

PARSER ERROR:
"""
${errorMessage || 'Unknown syntax error'}
"""

MERMAID INPUT:
"""
${code}
"""

FIXED MERMAID OUTPUT:`;

    try {
        const result = await generateWithGemini(prompt, apiKey, model, {
            temperature: 0.1,
            maxOutputTokens: 8192,
        });
        return stripCodeFence(result, 'mermaid');
    } catch (error) {
        throw new Error(`Failed to fix Mermaid: ${error.message}`);
    }
}

/**
 * Generate (or edit) a Mermaid diagram from a plain-language description.
 * If a `validate` function is given, one repair pass is attempted when the first result does not parse.
 * @param {string} description - What the diagram should show / what to change
 * @param {{current?: string, validate?: (code: string) => Promise<{message: string}|null>}} [options]
 *   current - Existing diagram to modify instead of starting from scratch
 * @returns {Promise<string>} - Mermaid code
 */
export async function generateMermaid(description, apiKey, model, { current = '', validate } = {}) {
    if (!description || !description.trim()) {
        throw new Error('Describe the diagram you want');
    }

    const task = current.trim()
        ? `Modify the EXISTING diagram below according to the request. Keep everything the request does not mention.

EXISTING DIAGRAM:
"""
${current}
"""

REQUEST:
"""
${description}
"""`
        : `Create a diagram for the request below. Choose the diagram type that fits best.

REQUEST:
"""
${description}
"""`;

    const prompt = `You are an expert at Mermaid diagrams. ${task}

${MERMAID_RULES}

MERMAID OUTPUT:`;

    try {
        let code = stripCodeFence(
            await generateWithGemini(prompt, apiKey, model, { temperature: 0.4, maxOutputTokens: 8192 }),
            'mermaid'
        );

        const error = validate ? await validate(code) : null;
        if (error) {
            code = await fixMermaid(code, error.message, apiKey, model);
        }

        return code;
    } catch (error) {
        throw new Error(`Failed to generate diagram: ${error.message}`);
    }
}

/**
 * Generate (or edit) a web page as HTML + CSS + JavaScript from a description.
 * @param {string} description - What the page should be / what to change
 * @param {{current?: {html: string, css: string, js: string}|null}} [options]
 *   current - Existing tabs to modify instead of starting from scratch
 * @returns {Promise<{html: string, css: string, js: string}>} - Contents for each tab
 */
export async function generateHTML(description, apiKey, model, { current = null } = {}) {
    if (!description || !description.trim()) {
        throw new Error('Describe the page you want');
    }

    const task = current
        ? `Modify the EXISTING page below according to the request. Keep everything the request does not mention, and keep existing ids, classes and function names so the three files keep working together.

REQUEST:
"""
${description}
"""

EXISTING FILES:

${FIX_MARKERS.html}
${current.html}
${FIX_MARKERS.css}
${current.css}
${FIX_MARKERS.js}
${current.js}
${FIX_MARKERS.end}`
        : `Create a page for the request below.

REQUEST:
"""
${description}
"""`;

    const prompt = `You are an expert front-end developer. You write a small web page as three separate files: HTML, CSS and JavaScript. ${task}

RULES:
1. HTML file: only the markup that belongs inside <body>. No <!DOCTYPE>, <html>, <head>, <body>, <style> or <script> tags.
2. CSS file: plain CSS for the HTML. JavaScript file: plain JavaScript that runs after the markup exists (the script is loaded at the end of the body). Do not wrap either file in tags.
3. Make it self-contained and working: no build step, no external libraries, fonts, images or network requests. Use inline SVG or CSS shapes for any graphics.
4. Responsive, accessible (semantic elements, labels, sufficient contrast) and good looking, with a coherent colour palette. Use 2-space indentation.
5. If a file is not needed (for example no JavaScript is required), leave its section empty.
6. Output EXACTLY the three sections below, with these marker lines on their own line, and nothing else - no explanations, no markdown code fences. Output the COMPLETE content of each file.

${FIX_MARKERS.html}
(complete HTML)
${FIX_MARKERS.css}
(complete CSS)
${FIX_MARKERS.js}
(complete JavaScript)
${FIX_MARKERS.end}`;

    try {
        const result = await generateWithGemini(prompt, apiKey, model, {
            temperature: 0.5,
            maxOutputTokens: 8192,
        });
        return parseFixSections(result);
    } catch (error) {
        throw new Error(`Failed to generate page: ${error.message}`);
    }
}

/**
 * Generate (or edit) JSON from a description. The result is guaranteed to be valid JSON
 * (one repair pass is attempted if the first answer does not parse), pretty-printed.
 * @param {string} description - What the data should look like / what to change
 * @param {{current?: string}} [options] - current: existing JSON to modify instead of starting fresh
 * @returns {Promise<string>} - Pretty-printed JSON
 */
export async function generateJSON(description, apiKey, model, { current = '' } = {}) {
    if (!description || !description.trim()) {
        throw new Error('Describe the JSON you want');
    }

    const task = current.trim()
        ? `Modify the EXISTING JSON below according to the request. Keep everything the request does not mention.

EXISTING JSON:
"""
${current}
"""

REQUEST:
"""
${description}
"""`
        : `Create JSON for the request below.

REQUEST:
"""
${description}
"""`;

    const prompt = `You are an expert at designing JSON data. ${task}

RULES:
1. Output ONLY valid JSON: no explanations, no comments, no markdown code fences
2. Use double quotes for all keys and strings, no trailing commas
3. Use realistic, varied sample values when you have to invent data (not "string", "foo" or "test")
4. Use clear, consistent key names and appropriate types (numbers as numbers, booleans as booleans, dates as ISO 8601 strings)
5. Use 2-space indentation

JSON OUTPUT:`;

    try {
        let result = stripCodeFence(
            await generateWithGemini(prompt, apiKey, model, { temperature: 0.4, maxOutputTokens: 8192 }),
            'json'
        );

        try {
            JSON.parse(result);
        } catch {
            // One repair pass; fixJSON throws if the result is still not valid JSON
            result = await fixJSON(result, apiKey, model);
        }

        return JSON.stringify(JSON.parse(result), null, 2);
    } catch (error) {
        throw new Error(`Failed to generate JSON: ${error.message}`);
    }
}

/**
 * Generate (or edit) a Markdown document from a description.
 * @param {string} description - What the document should be / what to change
 * @param {{current?: string}} [options] - current: existing Markdown to modify instead of starting fresh
 * @returns {Promise<string>} - Markdown
 */
export async function generateMarkdown(description, apiKey, model, { current = '' } = {}) {
    if (!description || !description.trim()) {
        throw new Error('Describe the document you want');
    }

    const task = current.trim()
        ? `Modify the EXISTING Markdown document below according to the request. Keep everything the request does not mention.

EXISTING DOCUMENT:
"""
${current}
"""

REQUEST:
"""
${description}
"""`
        : `Write a Markdown document for the request below.

REQUEST:
"""
${description}
"""`;

    const prompt = `You are an expert technical writer. ${task}

RULES:
1. Output ONLY the Markdown document: no explanations before or after it, and do not wrap the whole document in a code fence
2. Use GitHub-flavored Markdown: a single # title, ## sections, ### subsections, lists, tables, task lists (- [ ]), blockquotes and fenced code blocks with a language tag
3. Math is supported ($inline$ and $$block$$) and so are Mermaid diagrams (a \`\`\`mermaid fenced block); use them only when they genuinely help
4. Be accurate and well structured. Do not invent facts, statistics or links; when you are unsure, say so or leave a clear placeholder
5. Do not use raw HTML

MARKDOWN OUTPUT:`;

    try {
        const result = await generateWithGemini(prompt, apiKey, model, {
            temperature: 0.6,
            maxOutputTokens: 8192,
        });
        return stripCodeFence(result, 'markdown|md');
    } catch (error) {
        throw new Error(`Failed to generate Markdown: ${error.message}`);
    }
}
