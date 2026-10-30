
const FULL_DOC_RE = /^\s*(<!doctype|<html)/i;

function escapeAttr(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Styles for the classes emitted by renderJSON (they live in index.css, which exports do not include) */
export const JSON_EXPORT_CSS = `
  .json-preview-container { margin: 1rem 0; }
  .preview-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.6rem 1rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-bottom: none; border-radius: 8px 8px 0 0; font-size: 0.85rem; font-weight: 600; color: #0f172a; }
  .preview-toolbar.error { background: #fee2e2; border-color: #fca5a5; }
  .toolbar-stats { display: flex; gap: 0.5rem; }
  .stat-badge { padding: 0.1rem 0.5rem; border-radius: 999px; background: #e2e8f0; font-size: 0.75rem; font-weight: 500; }
  .stat-badge.valid { background: #d1fae5; color: #047857; }
  pre.json-code-preview { margin: 0; border-radius: 0 0 8px 8px; page-break-inside: auto !important; break-inside: auto !important; white-space: pre-wrap; word-break: break-word; font-size: 0.85rem; line-height: 1.7; }
  .json-code-preview code { display: block; font-family: 'Fira Code', 'Courier New', monospace; }
  .json-key { color: #60a5fa; font-weight: 600; }
  .json-string { color: #34d399; }
  .json-number { color: #f59e0b; font-weight: 600; }
  .json-boolean { color: #a78bfa; font-weight: 600; }
  .json-null { color: #94a3b8; font-style: italic; }
  .json-bracket { color: #f8fafc; font-weight: 700; }
  .json-empty { padding: 3rem 1rem; text-align: center; color: #64748b; border: 1px solid #cbd5e1; border-radius: 0 0 8px 8px; }
  .json-error-display { display: flex; gap: 1rem; padding: 1rem; margin: 0; background: #fef2f2; border: 1px solid #fca5a5; }
  .error-title { font-weight: 700; color: #b91c1c; }
  .error-message { font-family: 'Courier New', monospace; font-size: 0.85rem; color: #7f1d1d; margin-top: 0.5rem; }
  .error-suggestions { padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-top: none; font-size: 0.9rem; }
  .suggestion-title { font-weight: 600; }
`;

/**
 * Export content as an HTML file.
 * A complete HTML document (the HTML editor) is downloaded untouched; anything else is wrapped in a styled page.
 * @param {string} html - HTML content
 * @param {string} filename - Output filename
 * @param {{extraCss?: string}} [options]
 */
export function exportAsHTML(html, filename = 'document.html', { extraCss = '' } = {}) {
  const template = FULL_DOC_RE.test(html) ? html : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttr(filename.replace(/\.html$/, ''))}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.css" integrity="sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp" crossorigin="anonymous">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #1e293b;
      background: #ffffff;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    
    h1 { font-size: 2.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { font-size: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    h3 { font-size: 1.5rem; }
    
    p { margin: 1rem 0; }
    
    a {
      color: #0284c7;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      color: #0284c7;
    }
    
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      border: 1px solid #334155;
    }
    
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #0ea5e9;
      background: #f8fafc;
      padding: 0.5rem 1rem;
      margin: 1rem 0;
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      border: 1px solid #cbd5e1;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border: 1px solid #cbd5e1;
    }
    
    th {
      background: #f1f5f9;
      font-weight: 600;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    ul.contains-task-list {
      list-style: none;
      padding-left: 0;
    }
    
    ul.contains-task-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    ul.contains-task-list input[type="checkbox"] {
      margin-top: 0.25rem;
    }
    
    ${extraCss}

    @media print {
      body {
        max-width: 100%;
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  const blob = new Blob([template], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const PRINT_CSS = `
@page {
  size: A4;
  margin: 20mm;
}

* {
  box-sizing: border-box;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background: #ffffff;
  padding: 0;
  margin: 0;
  font-size: 12pt;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: #0f172a;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  page-break-after: avoid;
}

h1 { 
  font-size: 2rem; 
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}
h2 { 
  font-size: 1.5rem; 
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.4rem;
}
h3 { font-size: 1.25rem; }

/* Text */
p, li {
  color: #334155;
  margin: 0.75rem 0;
}

/* Links */
a {
  color: #2563eb;
  text-decoration: underline;
}

/* Inline code */
code {
  background: #f1f5f9;
  color: #0f172a;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

/* Code blocks */
pre {
  background: #1e293b !important;
  color: #f8fafc !important;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #475569;
  overflow-x: auto;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-wrap: break-word;
}

pre code {
  background: transparent !important;
  color: #f8fafc !important;
  padding: 0;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid #3b82f6;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  color: #475569;
  font-style: italic;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  page-break-inside: avoid;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #cbd5e1;
  color: #334155;
}

th {
  background: #f1f5f9 !important;
  font-weight: 600;
  color: #0f172a;
}

/* Lists */
ul, ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
}

/* SVG (Mermaid diagrams) */
svg {
  max-width: 100%;
  height: auto;
}

/* Task lists */
.task-list-item {
  list-style: none;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* HR */
hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
}
`;

/**
 * Print a complete HTML document through a hidden, sandboxed iframe.
 * The iframe has an opaque origin (no allow-same-origin), so scripts inside it
 * cannot reach the app's storage or DOM. A small bridge script waits for
 * stylesheets and fonts, calls print(), and reports back via postMessage.
 * Resolves once the print dialog is about to open; the iframe is removed after printing.
 */
function printDocument(docHtml) {
  return new Promise((resolve, reject) => {
    const token = `docklify-print-${Math.random().toString(36).slice(2)}`;
    const bridge = `<script>(function(){var t=${JSON.stringify(token)};
function send(s){parent.postMessage({token:t,status:s},'*');}
addEventListener('afterprint',function(){send('done');});
addEventListener('load',function(){
var f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
Promise.all([f,new Promise(function(r){setTimeout(r,300);})]).then(function(){send('printing');window.print();});
});})();</script>`;

    const bodyEnd = docHtml.lastIndexOf('</body>');
    const withBridge = bodyEnd === -1
      ? docHtml + bridge
      : docHtml.slice(0, bodyEnd) + bridge + docHtml.slice(bodyEnd);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts allow-modals');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;';

    let startTimer;
    let cleanupTimer;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(startTimer);
      clearTimeout(cleanupTimer);
      iframe.remove();
    };
    const onMessage = (event) => {
      if (event.source !== iframe.contentWindow || event.data?.token !== token) return;
      if (event.data.status === 'printing') {
        clearTimeout(startTimer);
        // Safety net in case afterprint never fires
        cleanupTimer = setTimeout(cleanup, 5 * 60 * 1000);
        resolve(true);
      } else if (event.data.status === 'done') {
        cleanup();
      }
    };

    window.addEventListener('message', onMessage);
    startTimer = setTimeout(() => {
      cleanup();
      reject(new Error('The print preview did not load in time.'));
    }, 30000);

    iframe.srcdoc = withBridge;
    document.body.appendChild(iframe);
  });
}

/**
 * Export an HTML string (rendered Markdown, JSON, diagram) as PDF via the browser print dialog.
 * @param {string} html - Body HTML to print
 * @param {string} filename - Output filename (used as document title)
 * @param {{extraCss?: string}} [options]
 */
export async function exportAsPDF(html, filename = 'document.pdf', { extraCss = '' } = {}) {
  const printHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeAttr(filename.replace(/\.pdf$/, ''))}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.css" integrity="sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp" crossorigin="anonymous">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
${PRINT_CSS}
${extraCss}
  </style>
</head>
<body>
${html}
</body>
</html>`;

  return printDocument(printHTML);
}

/**
 * Export raw HTML string as PDF (for HTML editor page)
 * Scripts in the user's HTML still run (so JS-drawn content prints), but inside the sandboxed iframe.
 * @param {string} htmlContent - Raw HTML string from editor
 * @param {string} filename - Output filename
 */
export async function exportHTMLAsPDF(htmlContent, filename = 'document.pdf') {
  const printContent = FULL_DOC_RE.test(htmlContent) ? htmlContent : `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeAttr(filename.replace(/\.pdf$/, ''))}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    body { font-family: sans-serif; line-height: 1.6; color: #1e293b; background: #fff; margin: 0; padding: 0; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`;

  return printDocument(printContent);
}

/**
 * Copy HTML to clipboard
 * @param {string} html - HTML content
 */
export async function copyHTMLToClipboard(html) {
  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = html;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!success) throw error;
    return true;
  }
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} - File content
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}
