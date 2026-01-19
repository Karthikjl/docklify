import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import katex from 'markdown-it-katex';
import DOMPurify from 'dompurify';

// Configure markdown-it with all plugins
const md = new MarkdownIt({
    html: false, // Disable HTML for security
    linkify: true, // Auto-convert URLs to links
    typographer: true, // Enable smart quotes and other typographic replacements
    breaks: true, // Convert \n to <br>
    highlight: function (str, lang) {
        // Basic syntax highlighting placeholder
        if (lang) {
            return `<pre class="language-${lang}"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }
        return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
})
    .use(taskLists, { enabled: true, label: true })
    .use(katex, {
        throwOnError: false,
        errorColor: '#cc0000'
    });

// Custom renderer for links to open in new tab
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
        tokens[idx].attrPush(['rel', 'noopener noreferrer']);
    } else {
        tokens[idx].attrs[aIndex][1] = '_blank';
    }

    return defaultRender(tokens, idx, options, env, self);
};

/**
 * Parse markdown to HTML with sanitization
 * @param {string} markdown - Raw markdown text
 * @returns {string} - Sanitized HTML
 */
export function parseMarkdown(markdown) {
    if (!markdown) return '';

    try {
        const html = md.render(markdown);

        // Sanitize HTML to prevent XSS attacks
        const clean = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'strong', 'em', 'u', 's', 'code', 'pre',
                'a', 'img',
                'ul', 'ol', 'li',
                'blockquote',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'div', 'span',
                'input', // For task lists
                'svg', 'path', 'g', 'rect', 'circle', 'line', 'polyline', 'polygon', 'text', // For mermaid
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel',
                'src', 'alt', 'title',
                'class', 'id',
                'type', 'checked', 'disabled',
                'align', 'colspan', 'rowspan',
                // SVG attributes for mermaid
                'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
                'fill', 'stroke', 'stroke-width', 'd', 'transform', 'points',
                'cx', 'cy', 'r', 'rx', 'ry',
            ],
            ALLOW_DATA_ATTR: true,
        });

        return clean;
    } catch (error) {
        console.error('Markdown parsing error:', error);
        return '<p class="text-red-500">Error parsing markdown</p>';
    }
}

/**
 * Get word count from markdown
 * @param {string} markdown - Raw markdown text
 * @returns {number} - Word count
 */
export function getWordCount(markdown) {
    if (!markdown) return 0;
    return markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Get character count from markdown
 * @param {string} markdown - Raw markdown text
 * @returns {number} - Character count
 */
export function getCharCount(markdown) {
    if (!markdown) return 0;
    return markdown.length;
}

/**
 * Get line count from markdown
 * @param {string} markdown - Raw markdown text
 * @returns {number} - Line count
 */
export function getLineCount(markdown) {
    if (!markdown) return 0;
    return markdown.split('\n').length;
}

export default md;
