'use client';

import { useMemo } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { renderJSON } from '../renderers/jsonRenderer';
import { useDebounce } from '../hooks/useDebounce';
import { FormatIcon, CodeIcon } from '../components/Icons';

export default function JsonPage({ jsonContent, setJsonContent, theme, fontSize, scrollSync, editorTheme }) {
    const debouncedJson = useDebounce(jsonContent, 120);
    const previewContent = useMemo(() => renderJSON(debouncedJson), [debouncedJson]);

    const handleFormatJSON = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            setJsonContent(JSON.stringify(parsed, null, 2));
        } catch {
            // handled by toast in parent
        }
    };

    return (
        <div className="h-full">
            <ResizablePanels
                theme={theme}
                leftPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800">
                        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0d0d10]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                JSON Editor
                            </h2>
                            <button
                                onClick={handleFormatJSON}
                                aria-label="Format JSON"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
                            >
                                <FormatIcon size={12} className="opacity-70" />
                                Format
                            </button>
                        </div>
                        <Editor
                            value={jsonContent}
                            onChange={setJsonContent}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={scrollSync}
                            language="json"
                            editorTheme={editorTheme}
                        />
                    </div>
                }
                rightPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
                        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0d0d10]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Pretty Print
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
