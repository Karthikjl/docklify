import html2pdf from 'html2pdf.js';

/**
 * Export markdown as HTML file
 * @param {string} html - HTML content
 * @param {string} filename - Output filename
 */
export function exportAsHTML(html, filename = 'document.html') {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename.replace('.html', '')}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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

/**
 * Export markdown as PDF file
 * @param {HTMLElement} element - DOM element to convert
 * @param {string} filename - Output filename
 */
export async function exportAsPDF(element, filename = 'document.pdf') {
    const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        await html2pdf().set(options).from(element).save();
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        throw error;
    }
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
