const STORAGE_KEYS = {
    MARKDOWN: 'markdown-viewer-content',
    THEME: 'markdown-viewer-theme',
    FONT_SIZE: 'markdown-viewer-font-size',
};

/**
 * Save markdown content to localStorage
 * @param {string} content - Markdown content
 */
export function saveMarkdown(content) {
    try {
        localStorage.setItem(STORAGE_KEYS.MARKDOWN, content);
    } catch (error) {
        console.error('Error saving markdown:', error);
    }
}

/**
 * Load markdown content from localStorage
 * @returns {string} - Saved markdown content
 */
export function loadMarkdown() {
    try {
        return localStorage.getItem(STORAGE_KEYS.MARKDOWN) || getDefaultMarkdown();
    } catch (error) {
        console.error('Error loading markdown:', error);
        return getDefaultMarkdown();
    }
}

/**
 * Save theme preference
 * @param {string} theme - 'light' or 'dark'
 */
export function saveTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

/**
 * Load theme preference
 * @returns {string} - Saved theme
 */
export function loadTheme() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        if (saved) return saved;

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    } catch (error) {
        console.error('Error loading theme:', error);
        return 'light';
    }
}

/**
 * Save font size preference
 * @param {number} size - Font size
 */
export function saveFontSize(size) {
    try {
        localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size.toString());
    } catch (error) {
        console.error('Error saving font size:', error);
    }
}

// HTML Content Storage
const HTML_CONTENT_KEY = 'doclify_html_content';

export function loadHTMLContent() {
    try {
        return localStorage.getItem(HTML_CONTENT_KEY);
    } catch (error) {
        console.error('Failed to load HTML content:', error);
        return null;
    }
}

export function saveHTMLContent(content) {
    try {
        localStorage.setItem(HTML_CONTENT_KEY, content);
    } catch (error) {
        console.error('Failed to save HTML content:', error);
    }
}

// JSON Content Storage
const JSON_CONTENT_KEY = 'doclify_json_content';

export function loadJSONContent() {
    try {
        return localStorage.getItem(JSON_CONTENT_KEY);
    } catch (error) {
        console.error('Failed to load JSON content:', error);
        return null;
    }
}

export function saveJSONContent(content) {
    try {
        localStorage.setItem(JSON_CONTENT_KEY, content);
    } catch (error) {
        console.error('Failed to save JSON content:', error);
    }
}

/**
 * Load font size preference
 * @returns {number} - Saved font size
 */
export function loadFontSize() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
        return saved ? parseInt(saved, 10) : 16;
    } catch (error) {
        console.error('Error loading font size:', error);
        return 16;
    }
}

/**
 * Clear all saved data
 */
export function clearStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
}

/**
 * Get default markdown content
 * @returns {string} - Default markdown
 */
function getDefaultMarkdown() {
    return `# Welcome to Markdown Viewer! 🎉

A **powerful** online markdown viewer with real-time preview.

## Features ✨

- 📝 **Live Preview** - See changes instantly
- 🎨 **Syntax Highlighting** - Beautiful code blocks
- 📊 **Mermaid Diagrams** - Create flowcharts and diagrams
- 🧮 **LaTeX Math** - Render mathematical formulas
- 📥 **Import/Export** - Upload .md files or export to HTML/PDF
- 🌓 **Dark Mode** - Easy on the eyes
- ✅ **Task Lists** - Track your todos

## Quick Examples

### Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Task List

- [x] Create amazing markdown viewer
- [x] Add live preview
- [ ] Share with friends
- [ ] Star the project ⭐

### Table

| Feature | Status |
|---------|--------|
| Editor | ✅ |
| Preview | ✅ |
| Export | ✅ |
| Mermaid | ✅ |

### Math (LaTeX)

Inline math: $E = mc^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

### Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

---

**Start editing** to see the magic happen! ✨
`;
}
