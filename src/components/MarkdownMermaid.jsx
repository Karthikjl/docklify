'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PanZoomViewer from './PanZoomViewer';
import { ExpandIcon } from './Icons';
import { renderMermaid, getDiagramBackground } from '../utils/mermaidRenderer';

const MIN_HEIGHT = 260;
const MAX_HEIGHT = 520;

/**
 * Interactive Mermaid diagram for the Markdown preview: pan, zoom (Ctrl/Cmd+wheel,
 * pinch, buttons) and an expand-to-overlay mode for large diagrams.
 */
export default function MarkdownMermaid({ code, theme }) {
    const [state, setState] = useState({ status: 'loading' });
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        renderMermaid(code, { appTheme: theme })
            .then((result) => !cancelled && setState({ status: 'ready', ...result }))
            .catch((err) => !cancelled && setState({ status: 'error', message: err?.message || String(err) }));
        return () => {
            cancelled = true;
        };
    }, [code, theme]);

    useEffect(() => {
        if (!expanded) return;
        const onKey = (e) => e.key === 'Escape' && setExpanded(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [expanded]);

    if (state.status === 'error') {
        return (
            <div className="text-red-500 p-4 border border-red-300 rounded">
                <strong>Mermaid Error: </strong>
                {state.message}
            </div>
        );
    }
    if (state.status === 'loading') {
        return <div className="p-4 text-sm text-zinc-500">Rendering diagram…</div>;
    }

    const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, state.height + 80));
    const expandButton = (
        <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Close expanded view (Esc)' : 'Expand diagram'}
            title={expanded ? 'Close (Esc)' : 'Expand'}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
        >
            <ExpandIcon size={13} />
        </button>
    );

    const viewer = (
        <PanZoomViewer
            svg={state.svg}
            width={state.width}
            height={state.height}
            background={getDiagramBackground(theme)}
            label="Mermaid diagram"
            zoomRequiresModifier={!expanded}
            extraControls={expandButton}
        />
    );

    if (expanded) {
        // Portal to <body>: an ancestor's transform (route fade-in) would otherwise trap `fixed`
        return (
            <>
                <div style={{ height }} />
                {createPortal(
                    <div className="fixed inset-0 z-[1000] bg-black/60 p-4 sm:p-8" onClick={() => setExpanded(false)}>
                        <div
                            className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {viewer}
                        </div>
                    </div>,
                    document.body
                )}
            </>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800" style={{ height }}>
            {viewer}
            <p className="sr-only">Drag to pan. Ctrl or Cmd plus scroll to zoom.</p>
        </div>
    );
}
