// Default sample content for each format (Minimalist edition)

export const DEFAULT_MARKDOWN = `# Welcome to Docklify

Docklify is a fast, minimalist multi-format document viewer and editor.

## Key Features

- **Markdown**: Full GFM support with Mermaid and KaTeX
- **HTML**: Live rendered preview in isolated environment
- **JSON**: Clean pretty printing and structure inspection
- **AI Assist**: Clean formatting and conversion tools

### Code Sample

\`\`\`javascript
function formatDocument(content, type) {
    return {
        type,
        timestamp: Date.now(),
        content: content.trim(),
    };
}
\`\`\`

### Status Matrix

| Format | Syntax | Preview | Export |
|---|---|---|---|
| Markdown | Supported | Live GFM | PDF / HTML |
| HTML | Supported | Isolated Iframe | PDF / Raw |
| JSON | Supported | Tree View | Clean Format |

### Flow Diagram

\`\`\`mermaid
graph LR
    A[Input] --> B[Parse]
    B --> C[Validate]
    C --> D[Render]
\`\`\`

> **Note**: Toggle AI mode in the toolbar to access automated restructuring tools.
`;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Docklify Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 620px;
            margin: 2rem auto;
            padding: 1.5rem;
            background: #09090b;
            color: #f4f4f5;
        }
        .card {
            background: #121215;
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.25rem;
        }
        h1 {
            font-size: 1.35rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.02em;
        }
        p {
            color: #a1a1aa;
            font-size: 0.875rem;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            background: #1c1c20;
            color: #d4d4d8;
            border: 1px solid #27272a;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
            margin: 0.25rem 0.25rem 0.25rem 0;
        }
        ul {
            color: #a1a1aa;
            font-size: 0.875rem;
            padding-left: 1.25rem;
            line-height: 1.7;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>HTML Preview</h1>
        <p>Edit the HTML on the left to inspect real-time rendered updates.</p>
        <div style="margin-top: 1rem;">
            <span class="badge">Live Render</span>
            <span class="badge">Sanitized</span>
            <span class="badge">Isolated</span>
        </div>
    </div>
    
    <div class="card">
        <h2 style="font-size: 1.05rem; font-weight: 600; margin: 0 0 0.5rem 0;">Key Capabilities</h2>
        <ul>
            <li>Syntax highlighting</li>
            <li>Instant bidirectional preview</li>
            <li>Clean isolated iframe container</li>
        </ul>
    </div>
</body>
</html>`;

export const DEFAULT_JSON = `{
  "app": "Docklify",
  "version": "1.0.0",
  "description": "Minimalist multi-format document editor",
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
      "capabilities": ["GFM", "Mermaid", "KaTeX", "Tables"]
    },
    {
      "name": "HTML",
      "capabilities": ["SyntaxHighlight", "LivePreview", "Sanitized"]
    },
    {
      "name": "JSON",
      "capabilities": ["PrettyPrint", "Validation", "Stats"]
    }
  ],
  "license": "MIT"
}`;
