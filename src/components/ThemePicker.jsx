'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EDITOR_THEMES } from '../utils/editorThemes';
import { PaletteIcon, CheckIcon } from './Icons';

function ThemeButton({ onClick, open, label, tokens, isMobile }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            aria-label={`Editor theme: ${label}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isMobile ? '4px' : '6px',
                padding: isMobile ? '5px 8px' : '5px 11px',
                borderRadius: '7px',
                border: tokens.btnBorder,
                background: hovered ? tokens.btnHoverBg : tokens.btnBg,
                color: tokens.btnColor,
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: 'none',
                transform: pressed ? 'scale(0.97)' : 'none',
                transition: 'background 0.15s ease, border-color 0.15s ease',
                outline: 'none',
                flexShrink: 0,
                whiteSpace: 'nowrap',
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.8 }}>
                <PaletteIcon size={14} />
            </span>
            {!isMobile && <span>{label}</span>}
            <span style={{
                display: 'inline-block',
                transition: 'transform 0.15s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '0.65rem',
                opacity: 0.6,
                marginLeft: '1px',
            }}>▾</span>
        </button>
    );
}

function DropdownItem({ label, swatchColor, isActive, tokens, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? tokens.dropActiveColor : tokens.dropItemColor,
                background: isActive ? tokens.dropActiveBg : hovered ? tokens.dropHoverBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '6px',
                transition: 'background 0.12s ease',
            }}
        >
            <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: swatchColor,
                flexShrink: 0,
                border: `1px solid ${tokens.swatchBorder}`,
            }} />
            <span style={{ flex: 1 }}>{label}</span>
            {isActive && (
                <span style={{ color: tokens.dropActiveColor, display: 'inline-flex', alignItems: 'center' }}>
                    <CheckIcon size={13} />
                </span>
            )}
        </button>
    );
}

export default function ThemePicker({ editorTheme = 'vs-dark', onEditorThemeChange, tokens, isLight, isMobile }) {
    const [open, setOpen] = useState(false);
    const [btnRect, setBtnRect] = useState(null);
    const dropdownRef = useRef(null);
    const btnRef = useRef(null);

    const currentTheme = EDITOR_THEMES.find(t => t.id === editorTheme) || EDITOR_THEMES[1];

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)
                && btnRef.current && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, []);

    const handleToggle = useCallback(() => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setBtnRect({ top: r.bottom + 6, right: window.innerWidth - r.right });
        }
        setOpen(o => !o);
    }, []);

    return (
        <div style={{ position: 'relative', zIndex: 9999, flexShrink: 0 }}>
            <div ref={btnRef}>
                <ThemeButton
                    onClick={handleToggle}
                    open={open}
                    label={currentTheme.label}
                    tokens={tokens}
                    isLight={isLight}
                    isMobile={isMobile}
                />
            </div>

            {open && (
                <div
                    ref={dropdownRef}
                    className="w-52 rounded-lg overflow-hidden"
                    style={{
                        position: isMobile ? 'fixed' : 'absolute',
                        ...(isMobile && btnRect
                            ? { top: btnRect.top, right: btnRect.right }
                            : { top: '100%', right: 0, marginTop: '6px' }
                        ),
                        background: tokens.dropBg,
                        border: tokens.dropBorder,
                        boxShadow: tokens.dropShadow,
                        zIndex: 99999,
                    }}
                >
                    <div style={{
                        padding: '8px 12px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: tokens.dropHeaderColor,
                        borderBottom: `1px solid ${tokens.dropDivider}`,
                    }}>
                        Editor Theme
                    </div>

                    <div style={{ padding: '4px' }}>
                        {EDITOR_THEMES.map((t) => {
                            const isActive = editorTheme === t.id;
                            const swatchColor = t.data
                                ? t.data.colors['editor.background']
                                : (t.id === 'vs-dark' ? '#1e1e1e' : '#ffffff');
                            return (
                                <DropdownItem
                                    key={t.id}
                                    label={t.label}
                                    swatchColor={swatchColor}
                                    isActive={isActive}
                                    tokens={tokens}
                                    onClick={() => {
                                        onEditorThemeChange(t.id);
                                        setOpen(false);
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
