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
        // Mark mermaid code blocks with a special class for client-side rendering
        if (lang && lang.toLowerCase() === 'mermaid') {
            return `<pre class="mermaid-code"><code class="language-mermaid">${md.utils.escapeHtml(str)}</code></pre>`;
        }

        // Basic syntax highlighting placeholder for other languages
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

// Add support for additional link protocols (including magnet links)
md.linkify.add('magnet:', {
    validate: function (text, pos, self) {
        const tail = text.slice(pos);
        if (!self.re.magnet) {
            self.re.magnet = new RegExp('^[?][^\\s]*');
        }
        if (self.re.magnet.test(tail)) {
            return tail.match(self.re.magnet)[0].length;
        }
        return 0;
    }
});

// Custom renderer for links to open in new tab and support all protocols
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target');
    const hrefIndex = tokens[idx].attrIndex('href');

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
    if (!markdown || !markdown.trim()) return '';

    try {
        const html = md.render(markdown);

        // Sanitize HTML to prevent XSS attacks
        // Note: mermaid code blocks are just <pre><code> at this stage — SVG is rendered later client-side
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
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel',
                'src', 'alt', 'title',
                'class', 'id',
                'type', 'checked', 'disabled',
                'align', 'colspan', 'rowspan',
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
