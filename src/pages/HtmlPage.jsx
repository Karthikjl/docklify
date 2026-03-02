import { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { formatHTML } from '../renderers/htmlRenderer';

export default function HtmlPage({ htmlContent, setHtmlContent, theme, fontSize, scrollSync }) {
    // No need to render/sanitize for iframe - it handles raw HTML securely
    // Just pass the raw HTML content directly

    const handleFormatHTML = () => {
        const formatted = formatHTML(htmlContent);
        setHtmlContent(formatted);
    };

    return (
        <ResizablePanels
            leftPanel={
                <div className="glass-panel flex flex-col h-full">
                    <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2">
                            🌐 HTML Editor
                        </h2>
                        <button
                            onClick={handleFormatHTML}
                            className="glass-btn text-xs px-3 py-1.5 hover:bg-slate-200/50 dark:hover:bg-white/20 transition-all"
                            title="Format HTML with indentation (local, no AI)"
                        >
                            📐 Format
                        </button>
                    </div>
                    <Editor
                        value={htmlContent}
                        onChange={setHtmlContent}
                        theme={theme}
                        fontSize={fontSize}
                        scrollSync={scrollSync}
                        language="html"
                    />
                </div>
            }
            rightPanel={
                <div className="glass-panel flex flex-col h-full">
                    <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2">
                            👁️ Rendered Preview
                        </h2>
                    </div>
                    <Preview
                        content={htmlContent}
                        theme={theme}
                        fontSize={fontSize}
                        scrollSync={scrollSync}
                        language="html"
                    />
                </div>
            }
        />
    );
}
