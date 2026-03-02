// Default sample content for each format

export const DEFAULT_MARKDOWN = `# Welcome to Doclify! 🚀

**Doclify** is a powerful multi-format document viewer with AI capabilities.

## Quick Start

### Features
- ✨ **Markdown** - Full GFM support with Mermaid & KaTeX
- 🌐 **HTML** - Syntax highlighting + live preview
- 📋 **JSON** - Pretty printing with validation
- 🤖 **AI Powered** - Smart formatting (Gemini/OpenAI)

### Example Code

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to Doclify\`;
}
\`\`\`

### Sample Table

| Format | Status | Features |
|--------|--------|----------|
| Markdown | ✅ | Mermaid, KaTeX, GFM |
| HTML | ✅ | Dual Preview |
| JSON | ✅ | Syntax Highlight |

### Mermaid Diagram

\`\`\`mermaid
graph LR
    A[Edit] --> B[Preview]
    B --> C[Export]
    C --> D[PDF/HTML]
\`\`\`

> **Tip**: Try the AI "Convert" button to format plain text into Markdown!

---

**Start editing** to see real-time preview! 💙
`;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Doclify HTML Demo</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            font-size: 2rem;
            margin: 0 0 1rem 0;
        }
        .badge {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            margin: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎨 HTML Preview</h1>
        <p>Edit the HTML on the left to see <strong>live updates</strong>!</p>
        <div>
            <span class="badge">✨ Beautiful</span>
            <span class="badge">🚀 Fast</span>
            <span class="badge">🔒 Secure</span>
        </div>
    </div>
    
    <div class="card">
        <h2>Features</h2>
        <ul>
            <li>Syntax highlighting</li>
            <li>Dual preview mode</li>
            <li>Sanitized rendering</li>
        </ul>
    </div>
</body>
</html>`;

export const DEFAULT_JSON = `{
  "app": "Doclify",
  "version": "1.0.0",
  "description": "Multi-format document viewer with AI",
  "features": {
    "markdown": true,
    "html": true,
    "json": true,
    "ai": true,
    "export": true
  },
  "formats": [
    {
      "name": "Markdown",
      "icon": "📝",
      "capabilities": ["GFM", "Mermaid", "KaTeX", "Tables"]
    },
    {
      "name": "HTML",
      "icon": "🌐",
      "capabilities": ["SyntaxHighlight", "LivePreview", "Sanitized"]
    },
    {
      "name": "JSON",
      "icon": "📋",
      "capabilities": ["PrettyPrint", "Validation", "Stats"]
    }
  ],
  "stats": {
    "linesOfCode": 5000,
    "components": 15,
    "downloads": 1337
  },
  "license": "MIT",
  "openSource": true
}`;
