'use client';

import { useState } from 'react';

/**
 * Minimalist action button (Upload, HTML, PDF, Copy, Clear)
 */
export function ToolBtn({ icon, label, onClick, tokens, isClear }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const bg = isClear
        ? (hovered ? tokens.clearHoverBg : tokens.clearBg)
        : (hovered ? tokens.btnHoverBg : tokens.btnBg);
    const border = isClear ? tokens.clearBorder : tokens.btnBorder;
    const color = isClear ? tokens.clearColor : tokens.btnColor;

    return (
        <button
            onClick={onClick}
            aria-label={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '7px',
                border,
                background: bg,
                color,
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: 'none',
                transform: pressed ? 'scale(0.97)' : 'none',
                transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
                lineHeight: 1.4,
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.85 }}>
                {icon}
            </span>
            <span className="toolbar-btn-label">{label}</span>
        </button>
    );
}

/**
 * Minimalist icon-only button (AI toggle, scroll sync, settings, theme, font size)
 */
export function IconBtn({ children, onClick, title, isActive, tokens }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const active = isActive ?? false;

    return (
        <button
            onClick={onClick}
            aria-label={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '7px',
                border: active ? tokens.iconActiveBorder : hovered ? tokens.iconHoverBorder : tokens.iconBorder,
                background: active ? tokens.iconActiveBg : hovered ? tokens.iconHoverBg : tokens.iconBg,
                color: active ? tokens.iconActiveColor : hovered ? tokens.iconHoverColor : tokens.iconColor,
                cursor: 'pointer',
                boxShadow: 'none',
                transform: pressed ? 'scale(0.95)' : 'none',
                transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                outline: 'none',
            }}
        >
            {children}
        </button>
    );
}
