import { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { renderJSON } from '../renderers/jsonRenderer';

export default function JsonPage({ jsonContent, setJsonContent, theme, fontSize, scrollSync }) {
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        setPreviewContent(renderJSON(jsonContent));
    }, [jsonContent]);

    const handleFormatJSON = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            setJsonContent(JSON.stringify(parsed, null, 2));
        } catch (e) {
            // handled by toast in parent
        }
    };

    return (
        <div className="h-full page-enter">
            <ResizablePanels
                leftPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-left">
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
                                🧾 JSON Editor
                            </h2>
                            <button
                                onClick={handleFormatJSON}
                                className="glass-btn text-xs px-3 py-1.5 hover:bg-slate-200/50 dark:hover:bg-white/20 transition-all btn-press hover-lift animate-in-delay-1"
                                title="Format JSON"
                            >
                                📐 Format
                            </button>
                        </div>
                        <Editor
                            value={jsonContent}
                            onChange={setJsonContent}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={scrollSync}
                            language="json"
                        />
                    </div>
                }
                rightPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-right">
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
                                👁️ Pretty Print
                            </h2>
                        </div>
                        <Preview
                            content={previewContent}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={scrollSync}
                        />
                    </div>
                }
            />
        </div>
    );
}
