/**
 * AI Service
 * LLM API integration for text-to-Markdown conversion
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

/**
 * Convert text to Markdown using Gemini API
 * @param {string} text - Plain text to convert
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<string>} - Converted Markdown
 */
export async function convertWithGemini(text, apiKey) {
    if (!text || !text.trim()) {
        throw new Error('Input text is empty');
    }

    if (!apiKey) {
        throw new Error('Gemini API key is required');
    }

    const prompt = PROMPT_TEMPLATE.replace('{{USER_TEXT}}', text);

    console.log('🔷 Gemini API call starting...');
    console.log('Text length:', text.length);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        console.log('🔷 Gemini response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;

            // Handle specific error codes
            if (response.status === 503) {
                throw new Error('Gemini API is temporarily overloaded. Please try again in a few seconds.');
            }
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            }
            if (response.status === 400) {
                throw new Error('Invalid request. Please check your input text.');
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }

        let result = data.candidates[0].content.parts[0].text.trim();

        // Clean the response - remove code block wrappers if AI added them
        // Sometimes AI wraps output in ```markdown ... ```
        if (result.startsWith('```markdown') || result.startsWith('```md')) {
            result = result.replace(/^```(?:markdown|md)\n/, '').replace(/\n```$/, '');
        } else if (result.startsWith('```')) {
            result = result.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return result.trim();
    } catch (error) {
        if (error.message.includes('API key') || error.message.includes('Invalid API key')) {
            throw new Error('Invalid Gemini API key. Please check your key in Settings.');
        }
        if (error.message.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please try again later or check your quota.');
        }
        if (error.message.includes('overloaded') || error.message.includes('503')) {
            throw new Error('⏳ Gemini is busy right now. Please wait 10-30 seconds and try again.');
        }
        throw error;
    }
}

/**
 * Convert text to Markdown using OpenAI API
 * @param {string} text - Plain text to convert
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - Converted Markdown
 */
export async function convertWithOpenAI(text, apiKey) {
    if (!text || !text.trim()) {
        throw new Error('Input text is empty');
    }

    if (!apiKey) {
        throw new Error('OpenAI API key is required');
    }

    const prompt = PROMPT_TEMPLATE.replace('{{USER_TEXT}}', text);

    try {
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that converts plain text to clean Markdown format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 2048,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('Invalid response from OpenAI API');
        }

        let result = data.choices[0].message.content.trim();

        // Clean the response - remove code block wrappers if AI added them
        if (result.startsWith('```markdown') || result.startsWith('```md')) {
            result = result.replace(/^```(?:markdown|md)\n/, '').replace(/\n```$/, '');
        } else if (result.startsWith('```')) {
            result = result.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return result.trim();
    } catch (error) {
        if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
            throw new Error('Invalid OpenAI API key. Please check your key and try again.');
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
            throw new Error('OpenAI API quota exceeded. Please try again later.');
        }
        throw error;
    }
}

/**
 * Convert text to Markdown using the specified provider
 * @param {string} text - Plain text to convert
 * @param {string} provider - 'gemini' or 'openai'
 * @param {string} apiKey - API key
 * @returns {Promise<string>} - Converted Markdown
 */
export async function convertToMarkdown(text, provider, apiKey) {
    if (provider === 'gemini') {
        return convertWithGemini(text, apiKey);
    } else if (provider === 'openai') {
        return convertWithOpenAI(text, apiKey);
    } else {
        throw new Error(`Unsupported provider: ${provider}`);
    }
}
