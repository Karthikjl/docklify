'use client';

import { useState } from 'react';
import { SparklesIcon } from './Icons';

/**
 * Modal asking the user to describe what AI should produce.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} title
 * @param {string} [description] - Helper text under the title
 * @param {string} [placeholder] - Textarea placeholder
 * @param {string} [submitLabel]
 * @param {Array<{value: string, label: string}>} [modes] - Optional segmented choice passed to onSubmit
 * @param {(text: string, mode: string) => Promise<void>} onSubmit - Should throw to show an error;
 *   resolving closes the dialog
 */
export default function AIPromptDialog({
    isOpen,
    onClose,
    title,
    description,
    placeholder,
    submitLabel = 'Generate',
    modes,
    onSubmit,
}) {
    const [text, setText] = useState('');
    const [mode, setMode] = useState(modes?.[0]?.value || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);
        setError('');
        try {
            await onSubmit(text.trim(), mode);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape' && !loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => !loading && onClose()} />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative w-full max-w-md bg-white dark:bg-[#0e0e11] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5"
            >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-700 dark:text-zinc-300">
                            <SparklesIcon size={16} />
                        </span>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs p-1 rounded transition-colors disabled:opacity-40"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3.5">
                    {description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
                    )}

                    {modes && (
                        <div className="flex items-center p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] w-fit">
                            {modes.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMode(m.value)}
                                    aria-pressed={mode === m.value}
                                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                        mode === m.value
                                            ? 'bg-white dark:bg-[#202025] text-zinc-900 dark:text-zinc-100 shadow-xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder}
                        rows={5}
                        disabled={loading}
                        className="w-full resize-none text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:opacity-60"
                    />

                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md p-2 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Ctrl+Enter to submit</span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || loading}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Working…' : submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
