'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, AlertCircleIcon, InfoIcon, XIcon } from './Icons';

const TOAST_ICONS = {
    success: (
        <span className="text-emerald-600 dark:text-emerald-400">
            <CheckIcon size={14} />
        </span>
    ),
    error: (
        <span className="text-red-600 dark:text-red-400">
            <AlertCircleIcon size={14} />
        </span>
    ),
    warning: (
        <span className="text-amber-600 dark:text-amber-400">
            <AlertCircleIcon size={14} />
        </span>
    ),
    info: (
        <span className="text-zinc-600 dark:text-zinc-400">
            <InfoIcon size={14} />
        </span>
    ),
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const icon = TOAST_ICONS[toast.type] || TOAST_ICONS.info;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onRemove(toast.id), 250);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [onRemove, toast.duration, toast.id]);

    const handleDismiss = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 250);
    };

    return (
        <div
            onClick={handleDismiss}
            style={{
                transform: visible && !leaving ? 'translateX(0)' : 'translateX(110%)',
                opacity: leaving ? 0 : 1,
                transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
            }}
            className="group relative flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md shadow-lg min-w-[260px] max-w-[340px] cursor-pointer overflow-hidden select-none"
        >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0 flex items-center justify-center">
                {icon}
            </div>

            {/* Text Message */}
            <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5 truncate">
                        {toast.title}
                    </div>
                )}
                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug break-words">
                    {toast.message}
                </div>
            </div>

            {/* Dismiss Button */}
            <button
                type="button"
                aria-label="Dismiss toast"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                }}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition-colors"
            >
                <XIcon size={12} />
            </button>

            {/* Minimalist Hairline Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
                <div
                    style={{
                        height: '100%',
                        animation: `toast-shrink ${toast.duration || 3000}ms linear forwards`,
                    }}
                    className="bg-zinc-400/60 dark:bg-zinc-500/50"
                />
            </div>
        </div>
    );
}

export default function Toast({ toasts, onRemove }) {
    return (
        <>
            <style>{`
                @keyframes toast-shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
            <div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '8px',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                }}
            >
                {toasts.slice(-3).map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <ToastItem toast={toast} onRemove={onRemove} />
                    </div>
                ))}
            </div>
        </>
    );
}

export { useToast } from '../hooks/useToast';
