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
 * Uses browser print dialog via hidden iframe - most reliable method
 * @param {HTMLElement} element - DOM element to convert
 * @param {string} filename - Output filename (used as document title)
 */
export async function exportAsPDF(element, filename = 'document.pdf') {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 0; height: 0;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Build print-friendly HTML with embedded styles
  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename.replace('.pdf', '')}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <style>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(printHTML);
  iframeDoc.close();

  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // Print the iframe
  try {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  } finally {
    // Cleanup after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  return true;
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
