/**
 * Per-tab wording for the shared "Generate with AI" dialog
 */
export const GENERATE_CONFIG = {
    markdown: {
        title: 'Generate a document',
        description: 'Describe the document you want, or say how to change the current one. AI writes it as Markdown.',
        placeholder: 'e.g. A README for a CLI tool that converts images to WebP: install, usage, options table and a FAQ',
        tooltip: 'Describe a document and let AI write the Markdown',
    },
    html: {
        title: 'Generate a web page',
        description: 'Describe the page or component. AI writes the HTML, CSS and JavaScript and fills the three tabs.',
        placeholder: 'e.g. A pricing page with three plans, a monthly/yearly toggle and a highlighted "popular" plan',
        tooltip: 'Describe a page and let AI write the HTML, CSS and JS',
    },
    json: {
        title: 'Generate JSON',
        description: 'Describe the data you need, or say how to change the current JSON. The result is always valid JSON.',
        placeholder: 'e.g. 5 sample users with id, name, email, role and a nested address (street, city, country)',
        tooltip: 'Describe data and let AI write the JSON',
    },
    mermaid: {
        title: 'Generate a diagram',
        description: 'Describe what the diagram should show. AI picks the diagram type and writes the Mermaid code.',
        placeholder: 'e.g. Checkout flow: cart, payment, stock check, order confirmation, and a failure path back to the cart',
        tooltip: 'Describe a diagram and let AI write it',
    },
};

/** Undo only exists in the desktop (Monaco) editor, not in the mobile textarea */
export function undoHint() {
    return typeof window !== 'undefined' && window.innerWidth >= 768 ? ' Ctrl+Z in the editor undoes it.' : '';
}
