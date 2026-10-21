'use client';

import { useMemo } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { renderMarkdown } from '../renderers/markdownRenderer';
import { useDebounce } from '../hooks/useDebounce';
import { useFullscreen } from '../hooks/useFullscreen';
import FullscreenButton from '../components/FullscreenButton';

export default function MarkdownPage({ markdown, setMarkdown, theme, fontSize, scrollSync, editorTheme }) {
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    // Debounce preview rendering to prevent main thread stutters during fast typing
    const debouncedMarkdown = useDebounce(markdown, 120);
    const isEmpty = !debouncedMarkdown?.trim();

    const previewContent = useMemo(() => {
        return isEmpty ? '' : renderMarkdown(debouncedMarkdown);
    }, [isEmpty, debouncedMarkdown]);

    return (
        <div className="h-full">
            <ResizablePanels
                previewExpanded={isFullscreen}
                theme={theme}
                leftPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800">
                        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0d0d10]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Markdown Editor
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
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
                        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0d0d10] flex justify-between items-center min-h-[41px]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Preview
                            </h2>
                            <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
                        </div>

                        {isEmpty ? (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-sm">
                                    <h3 className="text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                        No Content
                                    </h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Start typing in the editor on the left to render your Markdown.
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
