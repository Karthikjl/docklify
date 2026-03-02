import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Preview({ content, theme, fontSize, scrollSync, language }) {
    const previewRef = useRef(null);
    const containerRef = useRef(null);
    const scrollCount = useRef(0);

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

    // Render content and process Mermaid diagrams (for non-HTML)
    useEffect(() => {
        if (language === 'html' || !previewRef.current) return;

        // Inject content directly (it should be sanitized HTML by this point)
        previewRef.current.innerHTML = content || '';

        // Find all mermaid code blocks (marked by the markdown parser)
        const mermaidCodeBlocks = previewRef.current.querySelectorAll('pre.mermaid-code > code.language-mermaid');

        mermaidCodeBlocks.forEach((element, index) => {
            const code = element.textContent;
            const id = `mermaid-${Date.now()}-${index}`;

            // Create container for mermaid diagram
            const container = document.createElement('div');
            container.className = 'mermaid-container my-6 flex justify-center';
            container.id = id;

            // Replace code block with container
            const pre = element.parentElement;
            if (pre && pre.tagName === 'PRE') {
                pre.replaceWith(container);

                // Render mermaid diagram
                try {
                    mermaid.render(`mermaid-svg-${id}`, code).then(({ svg }) => {
                        container.innerHTML = svg;
                    }).catch((error) => {
                        console.error('Mermaid rendering error:', error);
                        container.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
              <strong>Mermaid Error:</strong> ${error.message}
            </div>`;
                    });
                } catch (error) {
                    console.error('Mermaid error:', error);
                    container.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
            <strong>Mermaid Error:</strong> ${error.message}
          </div>`;
                }
            }
        });

        // Make task list checkboxes interactive (read-only)
        const checkboxes = previewRef.current.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }, [content, language]);

    // Handle scroll sync from editor
    useEffect(() => {
        if (!scrollSync || !containerRef.current) return;

        const handleEditorScroll = (event) => {
            // Just process, don't check flag here

            const { scrollPercentage } = event.detail;
            if (containerRef.current) {
                const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
                const targetScrollTop = maxScroll * scrollPercentage;
                const currentScrollTop = containerRef.current.scrollTop;

                // Only trigger scroll if difference is significant
                if (Math.abs(targetScrollTop - currentScrollTop) > 5) {
                    scrollCount.current += 1;
                    containerRef.current.scrollTop = targetScrollTop;
                }
            }
        };

        window.addEventListener('editor-scroll', handleEditorScroll);
        return () => window.removeEventListener('editor-scroll', handleEditorScroll);
    }, [scrollSync]);

    // Handle scroll in preview
    const handleScroll = () => {
        if (!scrollSync || !containerRef.current) return;

        // If triggered programmatically, ignore and decrement counter
        if (scrollCount.current > 0) {
            scrollCount.current -= 1;
            return;
        }

        const scrollPercentage = containerRef.current.scrollTop /
            (containerRef.current.scrollHeight - containerRef.current.clientHeight);

        window.dispatchEvent(new CustomEvent('preview-scroll', {
            detail: { scrollPercentage }
        }));
    };

    // If HTML, render in iframe with srcdoc
    if (language === 'html') {
        // Show welcome message for empty HTML
        if (!content || content.trim() === '') {
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

    // Show welcome message if content is empty
    if (!content || content.trim() === '') {
        return (
            <div className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent flex items-center justify-center p-8">
                <div className="text-center max-w-md animate-in">
                    <div className="text-6xl mb-4">
                        {language === 'json' ? '📋' : '✨'}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                        {language === 'json' ? 'Ready for JSON!' : 'Start Creating!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {language === 'json'
                            ? 'Paste or type your JSON code in the editor. Format with the 📐 Format button, or fix errors with AI using the Fix JSON button.'
                            : 'Start typing in the editor to see your Markdown rendered beautifully here. Use headers, lists, code blocks, tables, and more!'
                        }
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-purple-500">💡</span>
                            <span>Tip: {language === 'json' ? 'Valid JSON will show syntax highlighting' : 'Try using Mermaid diagrams and KaTeX math'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, render normally (Markdown/JSON)
    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent"
            onScroll={handleScroll}
        >
            <div
                ref={previewRef}
                className="markdown-preview p-8 animate-in"
                style={{ fontSize: `${fontSize}px` }}
            />
        </div>
    );
}
