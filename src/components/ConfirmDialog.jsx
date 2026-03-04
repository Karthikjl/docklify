import { useEffect } from 'react';

/**
 * A beautiful, animated confirmation dialog panel.
 *
 * Props:
 *  isOpen       – boolean, controls visibility
 *  title        – heading text
 *  message      – body text
 *  onConfirm    – called when the user clicks "Confirm"
 *  onCancel     – called when the user dismisses or clicks "Cancel"
 *  confirmLabel – optional button label (default "Confirm")
 *  cancelLabel  – optional button label (default "Cancel")
 *  variant      – 'danger' | 'warning' | 'info' (default 'danger')
 */
export default function ConfirmDialog({
    isOpen,
    title = 'Are you sure?',
    message = '',
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
}) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantMap = {
        danger: { icon: '🗑️', accent: '#ef4444', accentRgb: '239 68 68', glow: 'rgba(239,68,68,0.35)', btnClass: 'confirm-btn-danger' },
        warning: { icon: '⚠️', accent: '#f59e0b', accentRgb: '245 158 11', glow: 'rgba(245,158,11,0.35)', btnClass: 'confirm-btn-warning' },
        info: { icon: 'ℹ️', accent: '#3b82f6', accentRgb: '59 130 246', glow: 'rgba(59,130,246,0.35)', btnClass: 'confirm-btn-info' },
    };
    const { icon, accent, accentRgb, glow, btnClass } = variantMap[variant] ?? variantMap.danger;

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className="confirm-backdrop"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* ── Panel ── */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="confirm-panel"
                style={{ '--accent': accent, '--glow': glow, '--accent-rgb': accentRgb }}
            >
                {/* Icon badge */}
                <div className="confirm-icon-badge">
                    <span className="confirm-icon">{icon}</span>
                </div>

                {/* Text */}
                <h2 id="confirm-title" className="confirm-title">{title}</h2>
                {message && <p className="confirm-message">{message}</p>}

                {/* Decorative neon divider */}
                <div className="confirm-divider" />

                {/* Actions */}
                <div className="confirm-actions">
                    <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className={`confirm-btn ${btnClass}`} onClick={onConfirm} autoFocus>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </>
    );
}
