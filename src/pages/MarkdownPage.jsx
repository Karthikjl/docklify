import { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { renderMarkdown } from '../renderers/markdownRenderer';

export default function MarkdownPage({ markdown, setMarkdown, theme, fontSize, scrollSync }) {
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        setPreviewContent(renderMarkdown(markdown));
    }, [markdown]);

    return (
        <ResizablePanels
            leftPanel={
                <div className="glass-panel flex flex-col h-full">
                    <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2">
                            📝 Markdown Editor
                        </h2>
                    </div>
                    <Editor
                        value={markdown}
                        onChange={setMarkdown}
                        theme={theme}
                        fontSize={fontSize}
                        scrollSync={scrollSync}
                        language="markdown"
                    />
                </div>
            }
            rightPanel={
                <div className="glass-panel flex flex-col h-full">
                    <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2">
                            👁️ Preview
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
    );
}
