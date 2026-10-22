# Docklify

Multi-format (Markdown, HTML, JSON, Mermaid) editor with live preview. Next.js App Router (static export), React 19, Monaco Editor, Tailwind CSS 3. Plain JavaScript (JSX), no TypeScript.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — static export to `out/` (`output: 'export'`)
- `npm run lint` — ESLint
- There is no test suite; manual checks live in `TESTING_GUIDE.md` and `TEST_SAMPLES.md`.

## Layout (`src/`)

- `app/` — routes: `/` (Markdown), `/html`, `/json`, `/mermaid`. `layout.jsx` mounts `EditorProvider` and `AppShell`; `template.jsx` gives the fade-in on route change.
- `context/EditorContext.jsx` — all shared state (content per format, theme, font size, AI settings, dialogs). Loads from localStorage in a mount effect and auto-saves with a 500ms debounce.
- `views/` — one page component per format; `components/` — shared UI (Header, Toolbar, Editor, Preview, dialogs).
- `renderers/` and `utils/` — Markdown/HTML/JSON/Mermaid rendering, export (HTML/PDF), AI (`aiService.js`, Gemini only), and storage (`storageUtils.js`).

## Conventions and gotchas

- Everything is client-side; there is no backend. Keep new code static-export compatible (no server routes, no `next/image` optimization).
- `basePath` is `/docklify` only on GitHub Actions. Reference public assets with `process.env.NEXT_PUBLIC_BASE_PATH`.
- Theme is applied before hydration by an inline script in `layout.jsx` and the shell stays hidden until `ready` is true. Keep both in sync with `loadTheme()` and the `markdown-viewer-theme` storage key.
- Sanitize rendered HTML with DOMPurify; the HTML preview runs in a sandboxed iframe.
- The AI API key is stored in the user's browser only; never log it or commit keys. `.env.local` is gitignored.
- Match the existing style: 4-space indent, single quotes, Tailwind utility classes, glass-style classes from `index.css`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
