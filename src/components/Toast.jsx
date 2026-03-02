import { useState, useEffect, useCallback } from 'react';

// Toast types config
const TOAST_STYLES = {
    success: {
        icon: '✅',
        bar: 'bg-emerald-400',
        bg: 'rgba(16,185,129,0.15)',
        border: 'rgba(16,185,129,0.35)',
        text: '#6ee7b7',
    },
    error: {
        icon: '❌',
        bar: 'bg-red-400',
        bg: 'rgba(239,68,68,0.15)',
        border: 'rgba(239,68,68,0.35)',
        text: '#fca5a5',
    },
    info: {
        icon: 'ℹ️',
        bar: 'bg-sky-400',
        bg: 'rgba(14,165,233,0.15)',
        border: 'rgba(14,165,233,0.35)',
        text: '#7dd3fc',
    },
    warning: {
        icon: '⚠️',
        bar: 'bg-amber-400',
        bg: 'rgba(245,158,11,0.15)',
        border: 'rgba(245,158,11,0.35)',
        text: '#fcd34d',
    },
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

    useEffect(() => {
        // Slide in
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onRemove(toast.id), 350);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            style={{
                transform: visible && !leaving ? 'translateX(0)' : 'translateX(110%)',
                opacity: leaving ? 0 : 1,
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
                background: `rgba(15,23,42,0.85)`,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${style.border}`,
                borderRadius: '14px',
                padding: '12px 16px',
                minWidth: '280px',
                maxWidth: '360px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
            }}
            onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350); }}
        >
            {/* Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{style.icon}</span>
                <div style={{ flex: 1 }}>
                    {toast.title && (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: style.text, marginBottom: '2px' }}>
                            {toast.title}
                        </div>
                    )}
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                        {toast.message}
                    </div>
                </div>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>×</span>
            </div>

            {/* Progress bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    borderRadius: '0 0 14px 14px',
                    width: '100%',
                    background: `rgba(255,255,255,0.1)`,
                }}
            >
                <div
                    className={style.bar}
                    style={{
                        height: '100%',
                        borderRadius: 'inherit',
                        animation: `toast-shrink ${toast.duration || 3000}ms linear forwards`,
                    }}
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
                    bottom: '60px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '10px',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <ToastItem toast={toast} onRemove={onRemove} />
                    </div>
                ))}
            </div>
        </>
    );
}

// Hook to use toasts
let _id = 0;
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

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
