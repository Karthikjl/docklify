# 🚀 Doclify

> A premium, multi-format document viewer and editor with live preview — built with React, Monaco Editor, and Vite.

![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff?logo=vite&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 📝 Three Editor Modes
| Mode | Description |
|------|-------------|
| **Markdown** | Full GFM rendering with live preview |
| **HTML** | Write & preview HTML in an isolated iframe |
| **JSON** | Validate, format & view JSON with syntax highlighting |

### 🎯 Markdown Capabilities
- **Mermaid Diagrams** — Flowcharts, sequence diagrams, class diagrams, Gantt, and more
- **KaTeX Math** — Inline (`$...$`) and block (`$$...$$`) LaTeX formulas
- **Task Lists** — Interactive checkboxes
- **Tables** — Full GitHub-flavored table support
- **Syntax Highlighting** — Language-labeled code blocks
- **Auto-linking** — URLs and custom protocols (including `magnet:`)
- **Blockquotes, footnotes, smart typography**

### 🖥️ Editor
- **Monaco Editor** (same engine as VS Code) with full markdown, HTML, and JSON language support
- Line numbers, word wrap, smooth scrolling, Fira Code font
- **Scroll Sync** — Editor and preview scroll together

### 📤 Export & Sharing
- **Export to HTML** — Download as a fully styled HTML file
- **Export to PDF** — Print-quality PDF export
- **Copy HTML** — Copy rendered HTML to clipboard
- **Upload** — Open `.md`, `.html`, `.htm`, `.json`, `.txt` files

### 🤖 AI Assistance
- **Convert to Markdown** — Paste any text; AI converts it to clean Markdown
- **Fix HTML / Fix JSON** — AI repairs broken HTML or JSON
- Supports **Gemini** and other AI providers

### 🎨 UI / UX
- **Glassmorphism Design** — Premium 4-tier glass panel system
- **Dark & Light Themes** — Toggle with full theme persistence
- **Editor Theme Picker** — 7 built-in Monaco editor themes (VS Dark, VS Light, Monokai, Dracula, One Dark, Night Owl, Solarized Dark, GitHub Light) with live preview and localStorage persistence
- **Smooth Sliding Tab** — Header tabs animate with a physics-spring pill instead of a flicker
- **Animated Background Orbs** — Subtle ambient glow effects
- **Smooth Animations** — Page transitions, fade-ins, bounce-in states
- **Resizable Panels** — Drag the divider to resize the editor/preview split
- **Font Size Control** — A− / A+ buttons in the toolbar
- **Auto-save** — Content persisted to localStorage every 500ms
- **Status Bar** — Live line, word, and character count

### 🔒 Security
- All Markdown HTML output sanitized via **DOMPurify** (XSS-safe)
- HTML in markdown is disabled by default
- External links open with `rel="noopener noreferrer"`

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

### Prerequisites
- Node.js **18+**
- npm **9+**

---

## 🛠️ Scripts

```bash
npm run dev       # Start development server (HMR)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## 📦 Tech Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2 | UI framework |
| `react-dom` | 19.2 | DOM rendering |
| `react-router-dom` | 7.13 | Client-side routing |
| `vite` | 7.2 | Build tool & dev server |

### Editor & Rendering
| Package | Purpose |
|---------|---------|
| `@monaco-editor/react` | VS Code-grade editor |
| `markdown-it` | Markdown parser |
| `markdown-it-task-lists` | Task list support |
| `markdown-it-katex` | LaTeX math rendering |
| `katex` | Math typesetting engine |
| `mermaid` | Diagram rendering |
| `dompurify` | XSS sanitization |

### Styling & Export
| Package | Purpose |
|---------|---------|
| `tailwindcss` + `@tailwindcss/typography` | Utility CSS + prose styles |
| `html2pdf.js` | PDF export |

---

## 📁 Project Structure

```
MdViewer/
├── src/
│   ├── components/
│   │   ├── Editor.jsx          # Monaco editor wrapper + scroll sync
│   │   ├── Preview.jsx         # Markdown/JSON live preview renderer
│   │   ├── Toolbar.jsx         # Top toolbar (upload, export, AI, settings)
│   │   ├── Header.jsx          # App header + navigation tabs
│   │   ├── StatusBar.jsx       # Bottom bar (lines / words / chars)
│   │   ├── ResizablePanels.jsx # Draggable split-pane layout
│   │   ├── AISettings.jsx      # AI provider configuration modal
│   │   └── Toast.jsx           # Notification toasts
│   ├── pages/
│   │   ├── MarkdownPage.jsx    # Markdown editor + preview page
│   │   ├── HtmlPage.jsx        # HTML editor + iframe preview page
│   │   └── JsonPage.jsx        # JSON editor + syntax preview page
│   ├── renderers/
│   │   ├── markdownRenderer.js # Calls markdown parser
│   │   ├── htmlRenderer.js     # HTML preview renderer
│   │   └── jsonRenderer.js     # JSON syntax highlighter
│   ├── utils/
│   │   ├── markdownParser.js   # markdown-it config, plugins, DOMPurify
│   │   ├── exportUtils.js      # HTML & PDF export logic
│   │   ├── storageUtils.js     # localStorage read/write
│   │   ├── editorThemes.js     # Monaco editor theme definitions (Monokai, Dracula, etc.)
│   │   ├── aiStorage.js        # AI key/provider persistence
│   │   ├── aiService.js        # AI API calls (Gemini etc.)
│   │   └── defaultContent.js   # Default content for each mode
│   ├── App.jsx                 # Root component, shared state, routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles, design tokens, animations
├── public/
│   └── logo.svg
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🎮 Usage Guide

### Markdown Mode
1. Type Markdown in the left editor — preview updates instantly on the right
2. Delete all content → ✨ **Start Creating!** placeholder appears
3. Use the toolbar to upload `.md` files or export to HTML/PDF

### HTML Mode
1. Write HTML fragments or full documents
2. Preview renders in a sandboxed `<iframe>`
3. Use AI **Fix HTML** to repair syntax errors

### JSON Mode
1. Paste or type JSON
2. Viewer shows syntax-highlighted output with error detection
3. Use **Format** (📐) or AI **Fix JSON** to clean up malformed JSON

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Auto-save confirmation |
| `Ctrl+A` | Select all (in editor) |

### AI Setup
1. Click the ⚙️ settings icon in the toolbar
2. Enter your **Gemini API key** (or other provider)
3. Click **Convert / Fix HTML / Fix JSON** to use AI features

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: { 400: '#38bdf8', 500: '#0ea5e9', ... },
  dark:    { 800: '#1e293b', 900: '#0f172a', ... }
}
```

### Change Fonts
```js
fontFamily: {
  sans: ['Inter', 'system-ui'],
  mono: ['Fira Code', 'monospace'],
}
```

### Adjust Animations
All animation keyframes and utility classes live in `src/index.css` under `@layer utilities`.

---

## 📄 License

MIT — free for personal and commercial use.

---

<div align="center">
  Built with ❤️ using React · Monaco Editor · Vite · Tailwind CSS
</div>
