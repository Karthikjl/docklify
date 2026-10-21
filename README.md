# Docklify

> A fast, minimalist multi-format (Markdown, HTML, JSON, Mermaid) document viewer and editor with live preview — built with Next.js 16 (App Router), React 19, Monaco Editor, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

### Multi-Format Editor Modes
| Mode | Description |
|---|---|
| **Markdown** | Full GitHub-Flavored Markdown (GFM) with live rendered preview |
| **HTML** | Write and preview HTML in a sandboxed, isolated container |
| **JSON** | Validate, inspect, and pretty-print JSON structures |
| **Mermaid** | Dedicated diagram viewer with live render, pan & zoom, and SVG/PNG export |

### Markdown Capabilities
- **Mermaid Diagrams** — Flowcharts, sequence diagrams, class diagrams, state diagrams, and Gantt charts
- **KaTeX Math** — Fast inline (`$...$`) and block (`$$...$$`) LaTeX typesetting
- **Task Lists** — Interactive GitHub task list checkboxes
- **Tables** — Formatted tabular data with responsive borders
- **Syntax Highlighting** — Language-labeled code blocks
- **Automatic Link Detection** — Standard and custom URI schemes (including `magnet:`)
- **Blockquotes, Footnotes & Typography**

### Mermaid Viewer
- **Live rendering** with syntax errors shown as a banner plus a squiggle on the offending line, while the last valid diagram stays visible
- **Pan & zoom** — drag to pan, scroll or pinch to zoom, double-click or `0` to fit, `1` for 100%, `+`/`-` and arrow keys
- **Export** to SVG (portable vector), PNG (2x), HTML and PDF, or copy the SVG markup
- **Themes** — match the app, or Default / Neutral / Forest / Dark
- **Examples** — flowchart, sequence, class, state, ER, Gantt, pie, mind map, user journey and git graph
- **AI** — *Fix Mermaid* repairs syntax using the real parser error (and skips the AI call when the diagram is already valid); *Generate* writes or edits a diagram from a description
- Upload `.mmd`, `.mermaid`, `.md` (first ` ```mermaid ` block) or `.txt`

### Monaco Editor Engine
- **VS Code Engine** (`@monaco-editor/react`) with syntax highlighting for Markdown, HTML, and JSON
- Line numbers, smart word wrap, and Fira Code monospace font
- **Bidirectional Scroll Sync** — Keep editor and preview synchronized as you scroll
- **Mobile Touch Fallback** — Optimized textarea editor for mobile touch browsers

### Export & Sharing
- **Export to HTML** — Download self-contained, fully styled HTML documents
- **Export to PDF** — High-resolution print-quality PDF export
- **Copy Content** — One-click clipboard copy
- **File Upload** — Open and edit `.md`, `.html`, `.htm`, `.json`, `.txt` files directly

### AI Assistance (Google Gemini)
- **Convert to Markdown** — Transform unstructured plain text into formatted Markdown
- **Fix Syntax** — AI repairs broken HTML/CSS/JS, JSON and Mermaid syntax
- **Generate** — in every editor, describe what you want and AI writes it (a Markdown document, a page across the HTML/CSS/Script tabs, valid JSON, or a diagram), or edits what you already have. Ctrl+Z undoes it in the desktop editor
- **Zero-Leak Client Storage** — Your API key is stored in your browser's `localStorage` and sent only to Google's Gemini API

### Minimalist Monochrome Design
- **Architectural Minimalism** — Flat neutral zinc surfaces, 1px hairline borders (`border-zinc-200 dark:border-zinc-800`), and zero visual noise
- **Circular Theme Transition** — Cinematic circular reveal expanding from the theme icon across the viewport
- **Monochrome SVG Icons** — Clean stroke-based vector icons (no OS emoji clutter)
- **7 Built-in Monaco Themes** — VS Dark, VS Light, Monokai, Dracula, One Dark, Night Owl, Solarized Dark, GitHub Light
- **Draggable Split Panels** — Resizable dual-panel workspace with mobile tab switching
- **Quiet Status Bar** — Live line, word, and character counts with auto-save indicator

### Security
- All rendered output is sanitized via **DOMPurify** (XSS protection)
- HTML execution in Markdown mode is disabled by default
- Sandboxed iframe container for HTML preview

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Turbopack)
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

### Prerequisites
- Node.js **18.17+** (Node.js 20+ recommended)
- npm **9+**

---

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack (http://localhost:3000)
npm run build    # Build optimized production bundle
npm run start    # Start production server
npm run lint     # Run ESLint validation
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| `next` | 16.4.0 | App Router framework with Turbopack |
| `react` | 19.2.0 | UI library |
| `@monaco-editor/react` | 4.7.0 | VS Code-powered code editor |
| `markdown-it` | 14.1.0 | Fast, extensible Markdown parser |
| `katex` | 0.16.27 | TeX math rendering engine |
| `mermaid` | 11.12.2 | Diagram and flowchart generator |
| `dompurify` | 3.3.1 | Client-side XSS sanitizer |
| `tailwindcss` | 3.4.19 | Utility-first styling system |

---

## Project Structure

```
Markdown-Viewer/
├── public/
│   └── logo.svg                 # Monochrome geometric brand monogram
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.jsx           # Root layout with font and metadata
│   │   ├── page.jsx             # Markdown editor route (/)
│   │   ├── html/page.jsx        # HTML editor route (/html)
│   │   ├── json/page.jsx        # JSON editor route (/json)
│   │   └── not-found.jsx        # 404 handler
│   ├── components/
│   │   ├── AppShell.jsx         # Main layout wrapper
│   │   ├── Header.jsx           # Nav tabs, brand logo, theme picker
│   │   ├── Toolbar.jsx          # Actions (upload, export, AI, theme toggle)
│   │   ├── ToolbarButtons.jsx   # Minimalist action button components
│   │   ├── Icons.jsx            # Custom monochrome vector SVG icons
│   │   ├── Editor.jsx           # Monaco editor wrapper + scroll sync
│   │   ├── MobileEditor.jsx     # Mobile textarea fallback
│   │   ├── Preview.jsx          # Markdown, Mermaid, and HTML iframe preview
│   │   ├── ResizablePanels.jsx  # Split-pane drag resizer & mobile tabs
│   │   ├── StatusBar.jsx        # Bottom status bar (lines, words, chars)
│   │   ├── ThemePicker.jsx      # Monaco theme dropdown
│   │   ├── AISettings.jsx       # AI configuration modal
│   │   ├── ConfirmDialog.jsx    # Minimalist clear confirmation dialog
│   │   └── Toast.jsx            # Hairline notification toasts
│   ├── context/
│   │   └── EditorContext.jsx    # Global document and editor state
│   ├── hooks/
│   │   ├── useDebounce.js       # Input debounce hook
│   │   ├── useToast.js          # Toast notification hook
│   │   └── useWindowWidth.js    # Responsive viewport breakpoint hook
│   ├── renderers/
│   │   ├── markdownRenderer.js  # Markdown pipeline (GFM + Mermaid + KaTeX)
│   │   ├── htmlRenderer.js      # HTML formatter
│   │   └── jsonRenderer.js      # JSON syntax highlighting
│   ├── utils/
│   │   ├── aiService.js         # Gemini API integration (model list, convert, fix)
│   │   ├── aiStorage.js         # LocalStorage persistence for AI credentials
│   │   ├── defaultContent.js    # Sample content templates
│   │   ├── editorThemes.js      # Monaco editor themes (Dracula, Monokai, etc.)
│   │   ├── exportUtils.js       # HTML and PDF file export utilities
│   │   ├── markdownParser.js    # markdown-it parser configuration
│   │   └── storageUtils.js      # Document auto-save storage
│   └── index.css                # Minimalist CSS design system tokens
├── next.config.mjs              # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Project dependencies & scripts
```

---

## Usage Guide

### Markdown Mode
1. Type Markdown on the left — preview updates live on the right.
2. Embed diagrams using ````mermaid```` code blocks.
3. Write math equations using `$inline$` or `$$block$$`.
4. Export to self-contained HTML or print-ready PDF using the toolbar.

### HTML Mode
1. Write or paste standard HTML or document fragments.
2. Preview renders in a secure, sandboxed `<iframe>`.
3. Click **Format** to beautify your markup, or use AI **Fix HTML** to repair syntax errors.

### JSON Mode
1. Paste or type raw JSON.
2. Click **Format** to prettify with standard 2-space indentation.
3. The right panel renders a syntax-highlighted, error-checked tree view.

### AI Setup
1. Enable AI Mode via the robot icon in the toolbar.
2. Click the settings gear icon to paste your **Google Gemini** API key. Once it is verified, pick a model from the list loaded for your key.
3. Use the contextual AI action button (**Convert**, **Fix HTML**, or **Fix JSON**).

---

## License

MIT — Free for personal and commercial use.
