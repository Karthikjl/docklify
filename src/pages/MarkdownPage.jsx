import { useState, useTransition, useEffect, useRef } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { renderMarkdown } from '../renderers/markdownRenderer';

export default function MarkdownPage({ markdown, setMarkdown, theme, fontSize, scrollSync, editorTheme }) {
    const [previewContent, setPreviewContent] = useState('');
    const [, startTransition] = useTransition();
    const isEmpty = !markdown?.trim();

    // Render markdown in a deferred transition so keystrokes stay snappy
    useEffect(() => {
        if (isEmpty) {
            setPreviewContent('');
            return;
        }
        startTransition(() => {
            setPreviewContent(renderMarkdown(markdown));
        });
    }, [markdown]);


    return (
        <div className="h-full page-enter">
            <ResizablePanels
                leftPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-left">
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
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
                            editorTheme={editorTheme}
                        />
                    </div>
                }
                rightPanel={
                    <div className="glass-panel flex flex-col h-full slide-in-right">
                        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 animate-in">
                                👁️ Preview
                            </h2>
                        </div>

                        {isEmpty ? (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-md welcome-bounce">
                                    <div className="text-6xl mb-4">✨<span className="cursor-blink">|</span></div>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                                        Start Creating!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Start typing in the editor to see your Markdown rendered beautifully here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Preview
                                content={previewContent}
                                theme={theme}
                                fontSize={fontSize}
                                scrollSync={scrollSync}
                            />
                        )}
                    </div>
                }
            />
        </div>
    );
}
