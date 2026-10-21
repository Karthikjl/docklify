import DOMPurify from 'dompurify';

/**
 * Render and sanitize HTML for preview (no extra styling)
 */
export function renderHTML(html) {
    if (!html) return '';

    if (typeof DOMPurify?.sanitize !== 'function') {
        return html;
    }

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
    if (!html || typeof document === 'undefined') return html || '';

    try {
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();

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

                    if (['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)) {
                        result += `${indentStr}${openTag}\n`;
                    } else if (node.childNodes.length > 0) {
                        result += `${indentStr}${openTag}\n`;
                        result += formatElement(node, indent + 1);
                        result += `${indentStr}</${tagName}>\n`;
                    } else {
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
        console.error('Format HTML error:', e);
        return html;
    }
}

/**
 * Format CSS with clean indentation and rules without breaking selectors, URLs, strings, or comments
 */
export function formatCSS(css) {
    if (!css || typeof css !== 'string') return '';

    try {
        // Step 1: Tokenize
        const tokens = [];
        let i = 0;
        const len = css.length;

        while (i < len) {
            const c = css[i];

            // 1. Comments /* ... */
            if (c === '/' && css[i + 1] === '*') {
                const start = i;
                i += 2;
                while (i < len && !(css[i] === '*' && css[i + 1] === '/')) {
                    i++;
                }
                i = Math.min(len, i + 2);
                tokens.push({ type: 'comment', value: css.slice(start, i) });
                continue;
            }

            // 2. Strings "..." or '...'
            if (c === '"' || c === "'") {
                const quote = c;
                const start = i;
                i++;
                while (i < len) {
                    if (css[i] === '\\') {
                        i += 2;
                    } else if (css[i] === quote) {
                        i++;
                        break;
                    } else {
                        i++;
                    }
                }
                tokens.push({ type: 'string', value: css.slice(start, i) });
                continue;
            }

            // 3. Parentheses: url(...), calc(...), var(...), :nth-child(...)
            if (c === '(') {
                const start = i;
                let depth = 1;
                i++;
                while (i < len && depth > 0) {
                    if (css[i] === '\\') {
                        i += 2;
                    } else if (css[i] === '"' || css[i] === "'") {
                        const q = css[i];
                        i++;
                        while (i < len && css[i] !== q) {
                            if (css[i] === '\\') i++;
                            i++;
                        }
                        if (i < len) i++;
                    } else if (css[i] === '(') {
                        depth++;
                        i++;
                    } else if (css[i] === ')') {
                        depth--;
                        i++;
                    } else {
                        i++;
                    }
                }
                tokens.push({ type: 'parens', value: css.slice(start, i) });
                continue;
            }

            // 4. Attribute brackets: [type="text"], [data-value="a, b"]
            if (c === '[') {
                const start = i;
                let depth = 1;
                i++;
                while (i < len && depth > 0) {
                    if (css[i] === '\\') {
                        i += 2;
                    } else if (css[i] === '"' || css[i] === "'") {
                        const q = css[i];
                        i++;
                        while (i < len && css[i] !== q) {
                            if (css[i] === '\\') i++;
                            i++;
                        }
                        if (i < len) i++;
                    } else if (css[i] === '[') {
                        depth++;
                        i++;
                    } else if (css[i] === ']') {
                        depth--;
                        i++;
                    } else {
                        i++;
                    }
                }
                tokens.push({ type: 'brackets', value: css.slice(start, i) });
                continue;
            }

            // 5. Structural delimiters: {, }, ;
            if (c === '{' || c === '}' || c === ';') {
                tokens.push({ type: 'delim', value: c });
                i++;
                continue;
            }

            // 6. Comma ,
            if (c === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }

            // 7. Colon : and Double Colon ::
            if (c === ':') {
                if (css[i + 1] === ':') {
                    tokens.push({ type: 'colon', value: '::' });
                    i += 2;
                } else {
                    tokens.push({ type: 'colon', value: ':' });
                    i++;
                }
                continue;
            }

            // 8. Whitespace
            if (/\s/.test(c)) {
                while (i < len && /\s/.test(css[i])) {
                    i++;
                }
                tokens.push({ type: 'space', value: ' ' });
                continue;
            }

            // 9. Identifiers / words / numbers / symbols
            const start = i;
            while (i < len && !/[\/\"\'\(\)\[\]\{\}\;\,:\s]/.test(css[i])) {
                i++;
            }
            tokens.push({ type: 'word', value: css.slice(start, i) });
        }

        // Helper to strip only trailing spaces/tabs, NOT newlines
        const stripTrailingSpaces = (s) => s.replace(/[ \t]+$/, '');

        // Step 2: Format using tokens
        let indent = 0;
        const indentStr = () => '  '.repeat(indent);
        let output = '';
        let atLineStart = true;

        // Helper to peek ahead for next statement-terminating delimiter among { , ; , }
        function peekNextDelimiter(startIdx) {
            for (let k = startIdx; k < tokens.length; k++) {
                const t = tokens[k];
                if (t.type === 'delim') {
                    return t.value; // '{', ';', or '}'
                }
            }
            return null;
        }

        for (let j = 0; j < tokens.length; j++) {
            const tok = tokens[j];

            if (tok.type === 'comment') {
                const commentLines = tok.value.trim().split('\n');
                if (!atLineStart) output = stripTrailingSpaces(output) + '\n';
                for (let cLine of commentLines) {
                    output += indentStr() + cLine.trim() + '\n';
                }
                atLineStart = true;
                continue;
            }

            if (tok.type === 'delim') {
                if (tok.value === '{') {
                    output = stripTrailingSpaces(output) + ' {\n';
                    indent++;
                    atLineStart = true;
                } else if (tok.value === '}') {
                    indent = Math.max(0, indent - 1);
                    output = output.replace(/\n+$/, '\n') + indentStr() + '}\n\n';
                    atLineStart = true;
                } else if (tok.value === ';') {
                    output = stripTrailingSpaces(output) + ';\n';
                    atLineStart = true;
                }
                continue;
            }

            if (tok.type === 'comma') {
                const nextDelim = peekNextDelimiter(j + 1);
                if (nextDelim === '{') {
                    // Comma in selector: put each selector on its own line
                    output = stripTrailingSpaces(output) + ',\n';
                    atLineStart = true;
                } else {
                    // Comma in property values (e.g. font-family: Arial, sans-serif;)
                    output = stripTrailingSpaces(output) + ', ';
                    atLineStart = false;
                }
                continue;
            }

            if (tok.type === 'colon') {
                if (atLineStart) {
                    output += indentStr();
                    atLineStart = false;
                }
                if (tok.value === '::') {
                    output = stripTrailingSpaces(output) + '::';
                } else {
                    const nextDelim = peekNextDelimiter(j + 1);
                    if (nextDelim === ';' || nextDelim === '}') {
                        output = stripTrailingSpaces(output) + ': ';
                    } else {
                        output = stripTrailingSpaces(output) + ':';
                    }
                }
                continue;
            }

            if (tok.type === 'space') {
                if (!atLineStart && !output.endsWith(' ') && !output.endsWith('\n') && !output.endsWith(':') && !output.endsWith('::')) {
                    output += ' ';
                }
                continue;
            }

            // Words, strings, parens, brackets
            if (atLineStart) {
                output += indentStr();
                atLineStart = false;
            }

            output += tok.value;
        }

        return output.replace(/\n{3,}/g, '\n\n').trim() + '\n';
    } catch (e) {
        console.error('Format CSS error:', e);
        return css;
    }
}

/**
 * Format JS with clean indentation
 */
export function formatJS(js) {
    if (!js) return '';
    try {
        const lines = js.split('\n');
        let indent = 0;
        const formattedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                formattedLines.push('');
                continue;
            }

            if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
                indent = Math.max(0, indent - 1);
            }

            formattedLines.push('  '.repeat(indent) + trimmed);

            if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                indent++;
            }
        }
        return formattedLines.join('\n');
    } catch {
        return js;
    }
}

/**
 * Split a full HTML document or fragment into { html, css, js }
 */
export function splitHTML(fullHTML) {
    if (!fullHTML) return { html: '', css: '', js: '' };

    let css = '';
    let js = '';
    let html = fullHTML;

    // Extract inline <style>...</style>
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches) {
        css = styleMatches.map(m => m.replace(/<style[^>]*>|<\/style>/gi, '').trim()).join('\n\n');
        html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    }

    // Extract inline classic <script>...</script>. Leave alone scripts with src=
    // and non-classic types (module, importmap, application/ld+json, ...), which
    // would break if merged into the plain Script tab.
    const classicScripts = [];
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, body) => {
        if (/\bsrc\s*=/i.test(attrs)) return match;
        const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i)?.[1]?.toLowerCase();
        const isClassic = !type || /^(text|application)\/(javascript|ecmascript)$/.test(type);
        if (!isClassic) return match;
        classicScripts.push(body.trim());
        return '';
    });
    js = classicScripts.join('\n\n');

    return {
        html: html.trim(),
        css: css.trim(),
        js: js.trim(),
    };
}

/**
 * Combine { html, css, js } into a full standalone HTML document
 */
export function buildFullHTML(html = '', css = '', js = '') {
    const hasDoctype = /<!doctype|<html/i.test(html.trim());

    if (hasDoctype) {
        let doc = html;
        // Replacement callbacks keep "$" sequences in user CSS/JS literal
        if (css && css.trim()) {
            const styleTag = `<style>\n${css}\n</style>\n`;
            if (/<\/head>/i.test(doc)) {
                doc = doc.replace(/<\/head>/i, () => `${styleTag}</head>`);
            } else if (/<body[\s>]/i.test(doc)) {
                doc = doc.replace(/<body[\s>]/i, (m) => `${styleTag}${m}`);
            } else {
                doc = styleTag + doc;
            }
        }
        if (js && js.trim()) {
            const scriptTag = `<script>\n${js}\n<\/script>\n`;
            if (/<\/body>/i.test(doc)) {
                doc = doc.replace(/<\/body>/i, () => `${scriptTag}</body>`);
            } else {
                doc = doc + `\n${scriptTag}`;
            }
        }
        return doc;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docklify Preview</title>
  ${css && css.trim() ? `<style>\n${css}\n</style>` : ''}
</head>
<body>
${html}
${js && js.trim() ? `<script>\n${js}\n<\/script>` : ''}
</body>
</html>`;
}

/**
 * Injects navigation guards into the HTML preview so clicking <a href="#"> or form submits
 * will NEVER navigate or reload the host app inside the iframe!
 */
export function injectPreviewGuards(htmlContent) {
    if (!htmlContent) return '';

    const guardScript = `
<script>
(function() {
  // 1. Prevent form submissions from reloading/navigating the iframe
  document.addEventListener('submit', function(e) {
    e.preventDefault();
  }, true);

  // 2. Intercept link clicks to prevent iframe from loading the host web application
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');

    var trimmedHref = (href || '').trim();

    // Prevent default navigation for empty, hash, javascript, or relative root links
    if (!trimmedHref || trimmedHref === '#' || trimmedHref.startsWith('javascript:') || trimmedHref === '/' || trimmedHref === './' || trimmedHref === '.') {
      e.preventDefault();
      return;
    }

    // Smooth scroll for in-page anchors (#section)
    if (trimmedHref.startsWith('#')) {
      e.preventDefault();
      try {
        var id = trimmedHref.slice(1);
        var el = document.getElementById(id) || document.querySelector(trimmedHref);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } catch(err) {}
      return;
    }

    // Force external or absolute links to open in a new tab instead of navigating inside the preview
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  }, true);

  // 3. Guard against location changes
  try {
    window.onbeforeunload = function() {
      return null;
    };
  } catch(err) {}
})();
<\/script>`;

    const baseTag = '<base target="_blank">';
    const isComplete = /<!doctype|<html/i.test(htmlContent.trim());

    if (isComplete) {
        let result = htmlContent;

        // Inject <base target="_blank"> in head
        // (\b-style match so <header> / <html-like> tags are not mistaken for <head>)
        if (/<head(?:\s[^>]*)?>/i.test(result)) {
            result = result.replace(/<head(?:\s[^>]*)?>/i, (m) => `${m}${baseTag}`);
        } else if (/<html(?:\s[^>]*)?>/i.test(result)) {
            result = result.replace(/<html(?:\s[^>]*)?>/i, (m) => `${m}<head>${baseTag}</head>`);
        }

        // Inject guardScript before </body> or at end
        if (/<\/body>/i.test(result)) {
            result = result.replace(/<\/body>/i, () => `${guardScript}</body>`);
        } else {
            result = result + guardScript;
        }

        return result;
    }

    // Fragment: wrap with standard shell and guards
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${baseTag}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: white;
      color: black;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
    }
  </style>
</head>
<body>
${htmlContent}
${guardScript}
</body>
</html>`;
}
