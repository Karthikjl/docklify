import { useState, useCallback } from 'react';

let _id = 0;

const DEFAULT_MAX_TOASTS = 3;

/**
 * Custom hook to manage toast notifications with a configurable max limit
 */
export function useToast(maxToasts = DEFAULT_MAX_TOASTS) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
        const id = ++_id;
        setToasts(prev => {
            const trimmed = prev.length >= maxToasts ? prev.slice(prev.length - maxToasts + 1) : prev;
            return [...trimmed, { id, type, title, message, duration }];
        });
    }, [maxToasts]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (message, title) => addToast({ type: 'success', title, message }),
        error: (message, title) => addToast({ type: 'error', title, message }),
        info: (message, title) => addToast({ type: 'info', title, message }),
        warning: (message, title) => addToast({ type: 'warning', title, message }),
    };

    return { toasts, removeToast, toast };
}
