'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Modern floating Tooltip component.
 * Replaces ugly browser native tooltips with a sleek, polished dark pill.
 *
 * @param {string|React.ReactNode} content - Text or node to display inside the tooltip
 * @param {'top'|'bottom'|'left'|'right'} position - Placement of the tooltip relative to child (default 'bottom')
 * @param {'center'|'start'|'end'} align - Alignment along the edge (default 'center')
 * @param {number} delay - Hover delay in ms before showing (default 120ms)
 * @param {string} shortcut - Optional keyboard shortcut badge (e.g., 'Ctrl+C')
 * @param {boolean} disabled - Whether tooltip is disabled
 * @param {React.ReactNode} children - The trigger element
 */
export default function Tooltip({
    content,
    position = 'bottom',
    align = 'center',
    delay = 120,
    shortcut,
    disabled = false,
    className = '',
    children,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);

    const show = () => {
        if (disabled || !content) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hide = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!content) return children;

    // Positioning classes
    let placementClass = '';
    let arrowClass = '';

    if (position === 'bottom') {
        if (align === 'end') {
            placementClass = 'top-full right-0 mt-2';
            arrowClass = '-top-1 right-3';
        } else if (align === 'start') {
            placementClass = 'top-full left-0 mt-2';
            arrowClass = '-top-1 left-3';
        } else {
            placementClass = 'top-full left-1/2 -translate-x-1/2 mt-2';
            arrowClass = '-top-1 left-1/2 -translate-x-1/2';
        }
    } else if (position === 'top') {
        if (align === 'end') {
            placementClass = 'bottom-full right-0 mb-2';
            arrowClass = '-bottom-1 right-3';
        } else if (align === 'start') {
            placementClass = 'bottom-full left-0 mb-2';
            arrowClass = '-bottom-1 left-3';
        } else {
            placementClass = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
            arrowClass = '-bottom-1 left-1/2 -translate-x-1/2';
        }
    } else if (position === 'left') {
        placementClass = 'right-full top-1/2 -translate-y-1/2 mr-2';
        arrowClass = '-right-1 top-1/2 -translate-y-1/2';
    } else if (position === 'right') {
        placementClass = 'left-full top-1/2 -translate-y-1/2 ml-2';
        arrowClass = '-left-1 top-1/2 -translate-y-1/2';
    }

    let borderClass = 'border-t border-l';
    if (position === 'top') borderClass = 'border-b border-r';
    else if (position === 'left') borderClass = 'border-t border-r';
    else if (position === 'right') borderClass = 'border-b border-l';

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}

            <div
                role="tooltip"
                aria-hidden={!isVisible}
                className={`absolute z-[9999] pointer-events-none whitespace-nowrap transition-all duration-150 ease-out ${placementClass} ${
                    isVisible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-1 invisible'
                }`}
            >
                <div className="relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight rounded-md bg-zinc-900 text-zinc-100 dark:bg-[#18181b] dark:text-zinc-100 border border-zinc-700/70 dark:border-zinc-700/80 shadow-md shadow-black/25">
                    {/* Subtle small caret / arrow */}
                    <span
                        className={`absolute w-1.5 h-1.5 rotate-45 bg-zinc-900 dark:bg-[#18181b] border-zinc-700/70 dark:border-zinc-700/80 ${borderClass} ${arrowClass}`}
                    />
                    <span className="relative z-10">{content}</span>
                    {shortcut && (
                        <kbd className="relative z-10 px-1 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700/80">
                            {shortcut}
                        </kbd>
                    )}
                </div>
            </div>
        </div>
    );
}
