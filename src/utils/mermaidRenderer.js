/**
 * Mermaid Renderer
 * Shared Mermaid configuration, safe rendering, validation and image export.
 * Used by the Markdown preview and the dedicated Mermaid viewer.
 */
import DOMPurify from 'dompurify';

// Mermaid is large: load it only when a diagram actually needs rendering
let mermaidPromise = null;
export function getMermaid() {
    if (!mermaidPromise) {
        mermaidPromise = import('mermaid').then((m) => m.default);
    }
    return mermaidPromise;
}

export const MERMAID_THEMES = [
    { value: 'app', label: 'Match app theme' },
    { value: 'default', label: 'Default' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'forest', label: 'Forest' },
    { value: 'dark', label: 'Dark' },
];

const EXPORT_FONT = 'Arial, Helvetica, sans-serif';

const APP_THEME_VARIABLES = {
    dark: {
        darkMode: true,
        background: 'transparent',
        primaryColor: '#1e293b',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#38bdf8',
        lineColor: '#94a3b8',
        secondaryColor: '#0f172a',
        tertiaryColor: '#1e293b',
        clusterBkg: '#1e293b',
        mainBkg: '#1e293b',
        nodeBorder: '#38bdf8',
        edgeLabelBackground: '#0f172a',
    },
    light: {
        darkMode: false,
        background: 'transparent',
        primaryColor: '#ffffff',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#0ea5e9',
        lineColor: '#64748b',
        secondaryColor: '#f8fafc',
        tertiaryColor: '#ffffff',
        clusterBkg: '#ffffff',
        mainBkg: '#ffffff',
        nodeBorder: '#0ea5e9',
        edgeLabelBackground: '#f8fafc',
    },
};

/**
 * Mermaid config for an app theme ('light' | 'dark') and a Mermaid theme choice.
 * Export renders avoid HTML labels (<foreignObject>) and web fonts so the SVG is
 * portable and can be drawn to a canvas without tainting it.
 */
export function buildMermaidConfig(appTheme, mermaidTheme = 'app', { forExport = false } = {}) {
    const fontFamily = forExport ? EXPORT_FONT : 'Poppins, sans-serif';
    const config = {
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
        fontFamily,
    };

    if (mermaidTheme === 'app') {
        config.theme = 'base';
        config.themeVariables = { ...APP_THEME_VARIABLES[appTheme === 'dark' ? 'dark' : 'light'], fontFamily };
    } else {
        config.theme = mermaidTheme;
        config.themeVariables = { fontFamily };
    }

    if (forExport) {
        config.htmlLabels = false;
        config.flowchart = { htmlLabels: false };
    }

    return config;
}

/** Background colour that the chosen theme is designed to be read on */
export function getDiagramBackground(appTheme, mermaidTheme = 'app') {
    if (mermaidTheme === 'app') return appTheme === 'dark' ? '#09090b' : '#ffffff';
    if (mermaidTheme === 'dark') return '#1f2020';
    return '#ffffff';
}

/**
 * Mermaid output is untrusted (it is built from user text): sanitize before inserting.
 * Node labels are HTML inside <foreignObject>, so it must be declared an HTML integration
 * point or DOMPurify strips every label. Interactive and remote-loading elements are blocked.
 */
export function sanitizeMermaidSvg(svg) {
    return DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true, html: true },
        ADD_TAGS: ['foreignobject'],
        HTML_INTEGRATION_POINTS: { foreignobject: true },
        FORBID_TAGS: ['form', 'input', 'button', 'textarea', 'select', 'img', 'video', 'audio', 'iframe', 'object', 'embed'],
    });
}

/**
 * Give the SVG explicit pixel dimensions (from its viewBox) and a namespace,
 * so it has a natural size for pan/zoom, file export and canvas drawing.
 * @returns {{svg: string, width: number, height: number}}
 */
export function normalizeSvg(svgString) {
    const holder = document.createElement('div');
    holder.innerHTML = svgString;
    const el = holder.querySelector('svg');
    if (!el) throw new Error('Mermaid did not return an SVG');

    const viewBox = el.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
    let width = viewBox?.length === 4 ? viewBox[2] : parseFloat(el.getAttribute('width'));
    let height = viewBox?.length === 4 ? viewBox[3] : parseFloat(el.getAttribute('height'));
    if (!(width > 0) || !(height > 0)) {
        width = 800;
        height = 600;
    }

    el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    el.setAttribute('width', String(Math.ceil(width)));
    el.setAttribute('height', String(Math.ceil(height)));
    if (!el.getAttribute('viewBox')) el.setAttribute('viewBox', `0 0 ${width} ${height}`);
    el.removeAttribute('style');
    el.style.display = 'block';

    return {
        svg: new XMLSerializer().serializeToString(el),
        width: Math.ceil(width),
        height: Math.ceil(height),
    };
}

// mermaid.render() is not re-entrant and shares global config, so renders run one at a time
let renderCounter = 0;
let renderQueue = Promise.resolve();

/**
 * Render Mermaid code to a sanitized, normalized SVG.
 * @param {string} code - Mermaid source
 * @param {{appTheme?: string, mermaidTheme?: string, forExport?: boolean}} [options]
 * @returns {Promise<{svg: string, width: number, height: number}>}
 */
export function renderMermaid(code, { appTheme = 'light', mermaidTheme = 'app', forExport = false } = {}) {
    const run = async () => {
        const mermaid = await getMermaid();
        mermaid.initialize(buildMermaidConfig(appTheme, mermaidTheme, { forExport }));
        const { svg } = await mermaid.render(`docklify-mermaid-${++renderCounter}`, code);
        return normalizeSvg(sanitizeMermaidSvg(svg));
    };

    const result = renderQueue.then(run, run);
    renderQueue = result.catch(() => {});
    return result;
}

/**
 * Check Mermaid syntax without rendering.
 * @returns {Promise<{message: string, line: number|null}|null>} - null when the code is valid
 */
export async function validateMermaid(code) {
    try {
        const mermaid = await getMermaid();
        await mermaid.parse(code);
        return null;
    } catch (err) {
        return describeMermaidError(err);
    }
}

/** Turn a Mermaid error into a message plus the (1-based) line it points at, when known */
export function describeMermaidError(err) {
    const message = String(err?.message || err || 'Unknown Mermaid error')
        .replace(/^Error:\s*/, '')
        .trim();
    const lineMatch = message.match(/line\s+(\d+)/i);
    // Unknown diagram type: the problem is the first line, which names the type
    const line = lineMatch ? Number(lineMatch[1]) : /no diagram type detected/i.test(message) ? 1 : null;
    return { message, line };
}

/**
 * Pull Mermaid code out of a file: the first ```mermaid fence of a Markdown file,
 * otherwise the whole file.
 */
export function extractMermaidCode(content) {
    const fence = content.match(/```+\s*mermaid[^\n]*\n([\s\S]*?)\n```+/i);
    return (fence ? fence[1] : content).trim();
}

/**
 * Draw an SVG to a PNG blob.
 * @param {string} svg - Normalized SVG markup (without HTML labels)
 * @param {{width: number, height: number, scale?: number, background?: string}} options
 */
export async function svgToPngBlob(svg, { width, height, scale = 2, background = '#ffffff' }) {
    // Keep within common browser canvas limits
    const MAX_SIDE = 16384;
    const MAX_PIXELS = 100_000_000;
    let s = scale;
    s = Math.min(s, MAX_SIDE / width, MAX_SIDE / height, Math.sqrt(MAX_PIXELS / (width * height)));
    s = Math.max(s, 0.1);

    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Could not draw the diagram to an image'));
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * s);
    canvas.height = Math.round(height * s);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))),
            'image/png'
        );
    });
}

/** Trigger a browser download for a Blob */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
