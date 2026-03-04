import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { formatHTML } from '../renderers/htmlRenderer';

export default function HtmlPage({ htmlContent, setHtmlContent, theme, fontSize, scrollSync, editorTheme }) {
    const handleFormatHTML = () => {
        const formatted = formatHTML(htmlContent);
        setHtmlContent(formatted);
    };

    return (
        <div className="h-full page-enter">
            <ResizablePanels
                theme={theme}
                leftPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-left" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
                                🌐 HTML Editor
                            </h2>
                            <button
                                onClick={handleFormatHTML}
                                className="glass-btn text-xs px-3 py-1.5 hover:bg-slate-200/50 dark:hover:bg-white/20 transition-all btn-press hover-lift animate-in-delay-1"
                                title="Format HTML"
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
                            editorTheme={editorTheme}
                        />
                    </div>
                }
                rightPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-right">
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
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
        </div>
    );
}
