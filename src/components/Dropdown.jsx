'use client';

import { useState, useRef, useEffect, useId } from 'react';

/**
 * Accessible custom dropdown (listbox) matching the app's minimal zinc styling.
 *
 * @param {Array<{value: string, label: string, description?: string}>} options
 * @param {string} value - Currently selected option value
 * @param {(value: string) => void} onChange - Called with the newly selected value
 * @param {string} [placeholder] - Shown when no option is selected
 * @param {string} [label] - Accessible label for the control
 * @param {boolean} [disabled]
 * @param {boolean} [searchable] - Show a filter input at the top of the list
 */
export default function Dropdown({ options, value, onChange, placeholder = 'Select...', label, disabled = false, searchable = false }) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [query, setQuery] = useState('');
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const searchRef = useRef(null);
    const listId = useId();

    const selectedIndex = options.findIndex((o) => o.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

    const needle = query.trim().toLowerCase();
    const visible = needle
        ? options.filter((o) =>
            `${o.label} ${o.value} ${o.description || ''}`.toLowerCase().includes(needle)
        )
        : options;

    const openList = () => {
        if (disabled) return;
        setQuery('');
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
    };

    const closeList = () => {
        setOpen(false);
        setQuery('');
    };

    const choose = (index) => {
        const option = visible[index];
        if (option) onChange(option.value);
        closeList();
    };

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
        setActiveIndex(0);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) closeList();
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    // Focus the search box when the list opens
    useEffect(() => {
        if (open && searchable) searchRef.current?.focus();
    }, [open, searchable]);

    // Keep the active option scrolled into view
    useEffect(() => {
        if (!open || !listRef.current) return;
        listRef.current.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIndex]);

    const handleKeyDown = (e) => {
        if (disabled) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) openList();
                else setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!open) openList();
                else setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Home':
                if (open && !searchable) { e.preventDefault(); setActiveIndex(0); }
                break;
            case 'End':
                if (open && !searchable) { e.preventDefault(); setActiveIndex(visible.length - 1); }
                break;
            case 'Enter':
            case ' ':
                // Space types into the search box instead of selecting
                if (e.key === ' ' && e.target === searchRef.current) break;
                e.preventDefault();
                if (open) choose(activeIndex);
                else openList();
                break;
            case 'Escape':
                if (open) {
                    // Don't let Esc also close a parent modal
                    e.stopPropagation();
                    closeList();
                    rootRef.current?.querySelector('button')?.focus();
                }
                break;
            case 'Tab':
                closeList();
                break;
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                role="combobox"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                disabled={disabled}
                onClick={() => (open ? closeList() : openList())}
                onKeyDown={handleKeyDown}
                className="w-full flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className={`truncate ${selected ? '' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`flex-shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div
                    onKeyDown={handleKeyDown}
                    className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] shadow-lg overflow-hidden"
                >
                    {searchable && (
                        <div className="p-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={handleQueryChange}
                                placeholder="Search..."
                                aria-label={label ? `Search ${label}` : 'Search options'}
                                aria-controls={listId}
                                autoComplete="off"
                                spellCheck={false}
                                className="w-full text-xs px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0e0e11] text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                    )}
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        aria-label={label}
                        className="max-h-56 overflow-y-auto custom-scrollbar py-1"
                    >
                        {visible.length === 0 && (
                            <li className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
                                No matches
                            </li>
                        )}
                        {visible.map((option, index) => {
                            const isSelected = option.value === value;
                            const isActive = index === activeIndex;
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => choose(index)}
                                    className={`px-3 py-1.5 cursor-pointer text-xs ${
                                        isActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                                    } ${isSelected ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}
                                >
                                    <div className="truncate">{option.label}</div>
                                    {option.description && (
                                        <div className="truncate text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {option.description}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
