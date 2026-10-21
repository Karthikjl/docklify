'use client';

import Tooltip from './Tooltip';
import { ExpandIcon, CollapseIcon } from './Icons';

export default function FullscreenButton({ isFullscreen, onToggle }) {
    const label = isFullscreen ? 'Exit full screen' : 'Full screen';
    return (
        <Tooltip content={label} align="end">
            <button
                type="button"
                onClick={onToggle}
                aria-label={label}
                aria-pressed={isFullscreen}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
            >
                {isFullscreen ? <CollapseIcon size={13} /> : <ExpandIcon size={13} />}
            </button>
        </Tooltip>
    );
}
