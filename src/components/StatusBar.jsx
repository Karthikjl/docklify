'use client';

import { memo, useMemo } from 'react';
import { getWordCount, getCharCount, getLineCount } from '../utils/markdownParser';
import { useDebounce } from '../hooks/useDebounce';

function StatusBar({ markdown }) {
    // Debounce stats calculation so large documents don't block main thread
    const debouncedMarkdown = useDebounce(markdown, 150);

    const stats = useMemo(() => {
        return [
            { label: 'Lines', value: getLineCount(debouncedMarkdown) },
            { label: 'Words', value: getWordCount(debouncedMarkdown) },
            { label: 'Characters', value: getCharCount(debouncedMarkdown) },
        ];
    }, [debouncedMarkdown]);

    return (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] px-4 py-1.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono select-none">
            <div className="flex items-center gap-4">
                {stats.map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{value}</span>
                    </div>
                ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Auto-saved</span>
            </div>
        </div>
    );
}

export default memo(StatusBar);
