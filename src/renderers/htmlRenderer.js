import DOMPurify from 'dompurify';

/**
 * Render and sanitize HTML for preview (no extra styling)
 */
export function renderHTML(html) {
    if (!html) return '';

    // Sanitize HTML but allow common layout and style tags for preview
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'div', 'span', 'article', 'section', 'main', 'header', 'footer', 'nav',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
            'strong', 'em', 'b', 'i', 'u', 's', 'cite', 'q', 'blockquote',
            'a', 'img', 'figure', 'figcaption',
            'pre', 'code', 'kbd', 'samp', 'var',
            'br', 'hr',
            'button', 'input', 'label', 'form',
            'style'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'id', 'style',
            'width', 'height', 'target', 'rel', 'colspan', 'rowspan',
            'type', 'name', 'value', 'placeholder'
        ],
        ALLOW_DATA_ATTR: true,
        ADD_TAGS: [],
    });
}

/**
 * Format HTML with pretty indentation
 */
export function formatHTML(html) {
    if (!html) return '';

    try {
        // Parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();

        // Function to format element with indentation
        function formatElement(element, indent = 0) {
            const indentStr = '  '.repeat(indent);
            let result = '';

            for (let node of element.childNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    const attributes = Array.from(node.attributes)
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(' ');

                    const openTag = attributes
                        ? `<${tagName} ${attributes}>`
                        : `<${tagName}>`;

                    // Self-closing or inline elements
                    if (['br', 'hr', 'img', 'input'].includes(tagName)) {
                        result += `${indentStr}${openTag}\n`;
                    }
                    // Elements with children
                    else if (node.childNodes.length > 0) {
                        result += `${indentStr}${openTag}\n`;
                        result += formatElement(node, indent + 1);
                        result += `${indentStr}</${tagName}>\n`;
                    }
                    // Empty elements
                    else {
                        result += `${indentStr}${openTag}</${tagName}>\n`;
                    }
                } else if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent.trim();
                    if (text) {
                        result += `${indentStr}${text}\n`;
                    }
                }
            }

            return result;
        }

        return formatElement(temp).trim();
    } catch (e) {
        console.error('Format error:', e);
        return html;
    }
}
