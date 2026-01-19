# Markdown Viewer - Complete Installation Guide

## 📦 Required Dependencies

Run the following command to install ALL required dependencies:

```bash
npm install
```

## 🔧 Additional Required Package

The project uses Tailwind CSS typography plugin for markdown styling. Install it with:

```bash
npm install -D @tailwindcss/typography
```

## 📋 Complete Installation Commands

If you're setting up from scratch or want to ensure all packages are installed:

```bash
# Install all dependencies
npm install

# Install Tailwind typography plugin
npm install -D @tailwindcss/typography

# Start development server
npm run dev
```

## 📦 Full Dependency List

### Production Dependencies:
- `@monaco-editor/react` - Code editor (VS Code engine)
- `markdown-it` - Markdown parser
- `markdown-it-task-lists` - Task list support
- `markdown-it-emoji` - Emoji support
- `markdown-it-katex` - LaTeX math rendering
- `katex` - Math typesetting library
- `mermaid` - Diagram rendering
- `dompurify` - XSS sanitization
- `html2pdf.js` - PDF export
- `react` - React framework
- `react-dom` - React DOM rendering

### Development Dependencies:
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `tailwindcss@^3` - CSS framework (v3 for compatibility)
- `@tailwindcss/typography` - Typography plugin for prose classes
- `postcss` - CSS processor
- `autoprefixer` - CSS vendor prefixing
- `eslint` - Linting

## 🚀 Quick Start

After installing dependencies:

```bash
npm run dev
```

Then open `http://localhost:5173/` in your browser.

## ✅ Verification

After installation, verify everything works:

1. ✅ Development server starts without errors
2. ✅ Application loads in browser
3. ✅ Monaco Editor displays on the left
4. ✅ Live preview works on the right
5. ✅ Theme toggle works (moon/sun icon)
6. ✅ Mermaid diagrams render
7. ✅ Math formulas display correctly

## 🐛 Troubleshooting

If you encounter issues:

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm install -D @tailwindcss/typography
   ```

2. **Check Node.js version:**
   - Requires Node.js 18+ 
   - Run `node --version` to check

3. **Port already in use:**
   - Change port in `vite.config.js` or kill process on port 5173
