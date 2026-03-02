import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Preview({ content, theme, fontSize, scrollSync, language }) {
    const previewRef = useRef(null);
    const containerRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false);

    // Keep scrollSyncRef current
    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    // Initialize Mermaid
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: theme === 'dark' ? 'base' : 'base',
            themeVariables: theme === 'dark' ? {
                darkMode: true,
                background: 'transparent',
                primaryColor: '#1e293b', // slate-800
                primaryTextColor: '#e2e8f0', // slate-200
                primaryBorderColor: '#38bdf8', // sky-400
                lineColor: '#94a3b8', // slate-400
                secondaryColor: '#0f172a', // slate-900
                tertiaryColor: '#1e293b', // slate-800
                mainBkg: '#1e293b', // slate-800
                nodeBorder: '#38bdf8', // sky-400
                // Match the label background to the dark background as much as possible
                // Using a very dark color that blends with the gradient better than gray
                edgeLabelBackground: '#0f172a', // slate-900
                fontFamily: 'Poppins, sans-serif',
            } : {
                darkMode: false,
                background: 'transparent',
                primaryColor: '#ffffff',
                primaryTextColor: '#0f172a', // slate-900
                primaryBorderColor: '#0ea5e9', // sky-500
                lineColor: '#64748b', // slate-500
                secondaryColor: '#f8fafc', // slate-50
                tertiaryColor: '#ffffff',
                mainBkg: '#ffffff',
                nodeBorder: '#0ea5e9',
                edgeLabelBackground: '#f8fafc', // Match light bg
                fontFamily: 'Poppins, sans-serif',
            },
            securityLevel: 'loose',
            fontFamily: 'Poppins, sans-serif',
        });
    }, [theme]);

    // For HTML: Render in isolated iframe
    // Using srcdoc for better React integration and to avoid document.write issues
    const getIframeContent = () => {
        if (language !== 'html') return '';

        const isCompleteDocument = content.trim().toLowerCase().startsWith('<!doctype') ||
            content.trim().toLowerCase().startsWith('<html');

        if (isCompleteDocument) {
            return content;
        } else {
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Minimal reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: white;
            color: black;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
        }
    </style>
</head>
<body>
${content}
</body>
</html>`;
        }
    };

    useEffect(() => {
        if (language === 'html' || !previewRef.current) return;

        // Clear first, then inject if content exists
        previewRef.current.innerHTML = '';
        if (!content) return;

        // Inject the rendered HTML
        previewRef.current.innerHTML = content;

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'base',
            themeVariables: theme === 'dark'
                ? {
                    background: 'transparent',
                    primaryColor: '#1e293b',
                    primaryTextColor: '#e2e8f0',
                    primaryBorderColor: '#38bdf8',
                    lineColor: '#94a3b8',
                    secondaryColor: '#0f172a',
                    tertiaryColor: '#1e293b',
                    edgeLabelBackground: '#1e293b',
                    clusterBkg: '#1e293b',
                    nodeBorder: '#38bdf8',
                    mainBkg: '#1e293b',
                    fontFamily: 'Poppins, sans-serif'
                }
                : {
                    background: 'transparent',
                    primaryColor: '#ffffff',
                    primaryTextColor: '#0f172a',
                    primaryBorderColor: '#0ea5e9',
                    lineColor: '#64748b',
                    secondaryColor: '#f8fafc',
                    tertiaryColor: '#ffffff',
                    edgeLabelBackground: '#ffffff',
                    clusterBkg: '#ffffff',
                    nodeBorder: '#0ea5e9',
                    mainBkg: '#ffffff',
                    fontFamily: 'Poppins, sans-serif'
                }
        });
        const mermaidCodeBlocks =
            previewRef.current.querySelectorAll(
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
                // Use deterministic ID instead of Date.now()
                const id = `mermaid-diagram-${index}`;

                mermaid
                    .render(id, code)
                    .then(({ svg }) => {
                        container.innerHTML = svg;

                        const svgEl = container.querySelector('svg');
                        if (svgEl) {
                            // Get Mermaid's computed dimensions
                            const w = parseFloat(svgEl.getAttribute('width')) || 0;
                            const h = parseFloat(svgEl.getAttribute('height')) || 0;

                            // Build viewBox from existing or from w/h
                            let viewBox = svgEl.getAttribute('viewBox');
                            if (!viewBox && w > 0 && h > 0) {
                                viewBox = `0 0 ${w} ${h}`;
                                svgEl.setAttribute('viewBox', viewBox);
                            }

                            // If viewBox has negative offsets (common in Mermaid),
                            // parse and use full extent so nothing is cropped
                            if (viewBox) {
                                const parts = viewBox.trim().split(/[\s,]+/).map(Number);
                                if (parts.length === 4) {
                                    const [vx, vy, vw, vh] = parts;
                                    // Normalize: start from 0,0, expand width/height to cover any negative offset
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

                            // Override any Mermaid inline style: fit inside container
                            svgEl.style.cssText = '';
                            svgEl.style.setProperty('display', 'block', 'important');
                            svgEl.style.setProperty('width', '100%', 'important');
                            svgEl.style.setProperty('height', 'auto', 'important');
                            svgEl.style.setProperty('max-height', '75vh', 'important');
                        }
                    })
                    .catch((err) => {
                        console.error('Mermaid render error:', err);
                        container.innerHTML = `
                <div class="text-red-500 p-4 border border-red-300 rounded">
                    <strong>Mermaid Error:</strong>
                    ${err.message}
                </div>
                `;
                    });
            } catch (err) {
                console.error(err);
            }
        });

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
    }, []); // mount/unmount only

    // Dispatch scroll events to editor when user scrolls preview
    const handleScroll = () => {
        if (!scrollSyncRef.current || !containerRef.current) return;
        if (isSyncingRef.current) return; // ignore programmatic scrolls

        const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        if (maxScroll <= 0) return;

        const scrollPercentage = containerRef.current.scrollTop / maxScroll;

        window.dispatchEvent(new CustomEvent('preview-scroll', {
            detail: { scrollPercentage }
        }));
    };

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
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
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
