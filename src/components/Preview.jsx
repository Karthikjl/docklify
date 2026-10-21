'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { injectPreviewGuards } from '../renderers/htmlRenderer';
import { buildMermaidConfig, sanitizeMermaidSvg } from '../utils/mermaidRenderer';

// No allow-same-origin: previewed code stays isolated from the app (and its saved API key).
// The rest lets typical pages work: dialogs (alert/confirm), form submit events, links that open
// in a new tab, and downloads.
const PREVIEW_SANDBOX = 'allow-scripts allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads';

export default function Preview({ content, theme, fontSize, scrollSync, language }) {
    const previewRef = useRef(null);
    const containerRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false);

    // Keep scrollSyncRef current
    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    const prevContentRef = useRef(null);
    const scrollRafRef = useRef(null);

    // Initialize Mermaid once per theme change (shared config with the Mermaid viewer)
    useEffect(() => {
        mermaid.initialize(buildMermaidConfig(theme));
    }, [theme]);

    // For HTML: Render in isolated iframe with navigation and form submission guards
    const getIframeContent = () => {
        if (language !== 'html' || !content) return '';
        return injectPreviewGuards(content);
    };

    useEffect(() => {
        if (language === 'html' || !previewRef.current) return;

        // Skip identical DOM updates
        if (prevContentRef.current === content && content) return;
        prevContentRef.current = content;

        if (!content) {
            previewRef.current.innerHTML = '';
            return;
        }

        // Direct innerHTML assignment avoids double-pass reflow
        previewRef.current.innerHTML = content;

        // Only search and render Mermaid if markdown contains mermaid blocks
        if (content.includes('mermaid')) {
            const mermaidCodeBlocks = previewRef.current.querySelectorAll(
                'pre.mermaid-code > code.language-mermaid'
            );

            mermaidCodeBlocks.forEach((element, index) => {
                const code = element.textContent?.trim();
                if (!code) return;

                const container = document.createElement('div');
                container.className = 'mermaid-container';

                const pre = element.closest('pre');
                if (!pre) return;

                pre.replaceWith(container);

                try {
                    const id = `mermaid-diagram-${index}-${Date.now()}`;
                    mermaid
                        .render(id, code)
                        .then(({ svg }) => {
                            // Mermaid output is untrusted: sanitize the SVG before inserting
                            container.innerHTML = sanitizeMermaidSvg(svg);
                            const svgEl = container.querySelector('svg');
                            if (svgEl) {
                                const w = parseFloat(svgEl.getAttribute('width')) || 0;
                                const h = parseFloat(svgEl.getAttribute('height')) || 0;
                                let viewBox = svgEl.getAttribute('viewBox');
                                if (!viewBox && w > 0 && h > 0) {
                                    viewBox = `0 0 ${w} ${h}`;
                                    svgEl.setAttribute('viewBox', viewBox);
                                }
                                if (viewBox) {
                                    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
                                    if (parts.length === 4) {
                                        const [vx, vy, vw, vh] = parts;
                                        const fullW = vw + Math.max(0, -vx);
                                        const fullH = vh + Math.max(0, -vy);
                                        const newVx = Math.min(0, vx);
                                        const newVy = Math.min(0, vy);
                                        svgEl.setAttribute('viewBox', `${newVx} ${newVy} ${fullW} ${fullH}`);
                                    }
                                }
                                svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                                svgEl.removeAttribute('width');
                                svgEl.removeAttribute('height');
                                svgEl.style.cssText = '';
                                svgEl.style.setProperty('display', 'block', 'important');
                                svgEl.style.setProperty('width', '100%', 'important');
                                svgEl.style.setProperty('height', 'auto', 'important');
                                svgEl.style.setProperty('max-height', '75vh', 'important');
                            }
                        })
                        .catch((err) => {
                            console.error('Mermaid render error:', err);
                            container.textContent = '';
                            const box = document.createElement('div');
                            box.className = 'text-red-500 p-4 border border-red-300 rounded';
                            const label = document.createElement('strong');
                            label.textContent = 'Mermaid Error: ';
                            box.append(label, document.createTextNode(err.message));
                            container.appendChild(box);
                        });
                } catch (err) {
                    console.error(err);
                }
            });
        }

        // Make task list checkboxes interactive (read-only)
        const checkboxes = previewRef.current.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }, [content, language, theme]);

    // Listen for editor-scroll events and mirror to preview
    // Always attach listener; refs guard enable/disable
    useEffect(() => {
        const handleEditorScroll = (event) => {
            if (!scrollSyncRef.current || !containerRef.current) return;

            const { scrollPercentage } = event.detail;
            const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
            if (maxScroll <= 0) return;

            const targetScrollTop = maxScroll * scrollPercentage;
            const currentScrollTop = containerRef.current.scrollTop;

            if (Math.abs(targetScrollTop - currentScrollTop) > 2) {
                isSyncingRef.current = true;
                containerRef.current.scrollTop = targetScrollTop;
                setTimeout(() => { isSyncingRef.current = false; }, 50);
            }
        };

        window.addEventListener('editor-scroll', handleEditorScroll);
        return () => window.removeEventListener('editor-scroll', handleEditorScroll);
    }, []);

    // Dispatch scroll events to editor throttled by requestAnimationFrame
    const handleScroll = () => {
        if (!scrollSyncRef.current || !containerRef.current) return;
        if (isSyncingRef.current) return;

        if (scrollRafRef.current) return;
        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;
            if (!containerRef.current) return;

            const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
            if (maxScroll <= 0) return;

            const scrollPercentage = containerRef.current.scrollTop / maxScroll;

            window.dispatchEvent(new CustomEvent('preview-scroll', {
                detail: { scrollPercentage }
            }));
        });
    };

    useEffect(() => {
        return () => {
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
        };
    }, []);

    // If HTML, render in iframe with srcdoc
    if (language === 'html') {
        // Show welcome message for empty HTML
        if (!content?.trim()) {
            return (
                <div className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent flex items-center justify-center p-8">
                    <div className="text-center max-w-md animate-in">
                        <div className="text-6xl mb-4">🌐</div>
                        <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                            HTML Preview Ready
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Write or paste your HTML code in the editor. Use the 📐 Format button to beautify valid HTML, or the Fix HTML button (AI) to fix syntax errors.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-purple-500">💡</span>
                                <span>Tip: Complete HTML documents and fragments both work!</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                ref={containerRef}
                className="h-full w-full overflow-hidden"
                onScroll={handleScroll}
            >
                <iframe
                    title="HTML Preview"
                    srcDoc={getIframeContent()}
                    className="w-full h-full border-0 bg-white"
                    sandbox={PREVIEW_SANDBOX}
                />
            </div>
        );
    }

    // Render markdown / JSON content
    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent"
            onScroll={handleScroll}
        >
            <div
                ref={previewRef}
                className="markdown-preview p-8"
                style={{ fontSize: `${fontSize}px` }}
            />
        </div>
    );
}
