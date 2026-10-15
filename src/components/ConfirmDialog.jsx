'use client';

import { useEffect } from 'react';
import { TrashIcon } from './Icons';

/**
 * Minimalist confirmation dialog panel.
 */
export default function ConfirmDialog({
    isOpen,
    title = 'Clear document?',
    message = 'This will remove all current content. This action cannot be undone.',
    onConfirm,
    onCancel,
    confirmLabel = 'Clear',
    cancelLabel = 'Cancel',
    icon,
}) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Dialog Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="relative w-full max-w-sm bg-white dark:bg-[#0e0e11] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-5 flex flex-col items-center text-center"
            >
                {/* Minimalist icon badge */}
                <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161a] flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-3.5">
                    {icon || <TrashIcon size={16} />}
                </div>

                {/* Text */}
                <h2 id="confirm-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                {message && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed max-w-[280px]">
                        {message}
                    </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 mt-5 w-full">
                    <button
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
