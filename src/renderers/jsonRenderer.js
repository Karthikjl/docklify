/**
 * Add syntax highlighting to JSON
 */
function highlightJSON(jsonString) {
    if (!jsonString) return '';

    // Escape HTML
    const escaped = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Apply syntax highlighting
    return escaped
        // Strings (keys and values)
        .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="json-key">$1</span>:')
        // String values
        .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="json-string">$1</span>')
        // Numbers
        .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
        // Booleans
        .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
        // Null
        .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
        // Brackets and braces
        .replace(/([{}[\]])/g, '<span class="json-bracket">$1</span>');
}

/**
 * Render JSON with pretty formatting and syntax highlighting
 */
export function renderJSON(text) {
    if (!text) {
        return `
            <div class="json-preview-container">
                <div class="preview-toolbar">
                    <span class="toolbar-title">📋 JSON Preview</span>
                    <span class="toolbar-status empty">Empty</span>
                </div>
                <div class="json-empty">
                    <div class="empty-icon">📄</div>
                    <div class="empty-text">No JSON content to display</div>
                </div>
            </div>
        `;
    }

    try {
        // Parse and validate JSON
        const obj = JSON.parse(text);
        const pretty = JSON.stringify(obj, null, 2);

        // Add syntax highlighting
        const highlighted = highlightJSON(pretty);

        // Calculate stats
        const lines = pretty.split('\n').length;
        const keys = JSON.stringify(obj).match(/"[^"]+"\s*:/g)?.length || 0;

        return `
            <div class="json-preview-container">
                <div class="preview-toolbar">
                    <span class="toolbar-title">✨ Formatted JSON</span>
                    <span class="toolbar-stats">
                        <span class="stat-badge">${lines} lines</span>
                        <span class="stat-badge">${keys} keys</span>
                        <span class="stat-badge valid">✓ Valid</span>
                    </span>
                </div>
                <pre class="json-code-preview"><code>${highlighted}</code></pre>
            </div>
        `;
    } catch (e) {
        // Enhanced error display
        const errorLine = e.message.match(/position (\d+)/)?.[1];

        return `
            <div class="json-preview-container error">
                <div class="preview-toolbar error">
                    <span class="toolbar-title">⚠️ Invalid JSON</span>
                    <span class="toolbar-status error">Parse Error</span>
                </div>
                <div class="json-error-display">
                    <div class="error-icon">⚠️</div>
                    <div class="error-content">
                        <div class="error-title">JSON Syntax Error</div>
                        <div class="error-message">${escapeHtml(e.message)}</div>
                        ${errorLine ? `<div class="error-hint">Check around position ${errorLine}</div>` : ''}
                    </div>
                </div>
                <div class="error-suggestions">
                    <div class="suggestion-title">💡 Common Issues:</div>
                    <ul class="suggestion-list">
                        <li>Missing or extra commas</li>
                        <li>Unquoted keys or values</li>
                        <li>Trailing commas in objects/arrays</li>
                        <li>Single quotes instead of double quotes</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
