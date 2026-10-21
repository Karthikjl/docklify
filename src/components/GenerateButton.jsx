'use client';

import Tooltip from './Tooltip';
import { SparklesIcon } from './Icons';

/** "Generate with AI" button shown in an editor header while AI Mode is on */
export default function GenerateButton({ onClick, tooltip = 'Generate with AI' }) {
    return (
        <Tooltip content={tooltip}>
            <button
                type="button"
                onClick={onClick}
                aria-label="Generate with AI"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
            >
                <SparklesIcon size={12} className="opacity-70" />
                <span>Generate</span>
            </button>
        </Tooltip>
    );
}
