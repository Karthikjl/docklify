import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { EDITOR_THEMES } from '../utils/editorThemes';

const TABS = [
    { path: '/', label: 'Markdown', exact: true },
    { path: '/html', label: 'HTML', exact: false },
    { path: '/json', label: 'JSON', exact: false },
];

export default function Header({ editorTheme = 'vs-dark', onEditorThemeChange, theme = 'dark' }) {
    const [open, setOpen] = useState(false);
    const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 });
    const dropdownRef = useRef(null);
    const tabRefs = useRef([]);
    const location = useLocation();
    const isLight = theme === 'light';

    // Active tab index
    const activeIndex = TABS.findIndex(t =>
        t.exact ? location.pathname === t.path : location.pathname.startsWith(t.path)
    );
    const safeIndex = activeIndex === -1 ? 0 : activeIndex;

    // Measure actual tab element to position pill perfectly
    useEffect(() => {
        const el = tabRefs.current[safeIndex];
        if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }, [safeIndex]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentTheme = EDITOR_THEMES.find(t => t.id === editorTheme) || EDITOR_THEMES[1];

    // ── Theme tokens ──────────────────────────────────────────────
    const tokens = isLight ? {
        // Nav container
        navBg: 'rgba(224,231,255,0.55)',
        navBorder: '1px solid rgba(99,102,241,0.2)',
        navShadow: '0 2px 12px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        // Pill (sliding indicator)
        pillBg: 'rgba(255,255,255,0.97)',
        pillShadow: '0 2px 10px rgba(99,102,241,0.22), 0 0 0 1px rgba(99,102,241,0.2)',
        // Tab text colours (handled in className below)
        activeText: '#4338ca',
        inactiveText: '#64748b',
        // Theme button
        btnBg: 'rgba(238,241,255,0.85)',
        btnBorder: '1px solid rgba(99,102,241,0.3)',
        btnColor: '#4338ca',
        btnShadow: '0 2px 10px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
        btnHoverShadow: '0 4px 20px rgba(99,102,241,0.35), 0 0 0 2px rgba(99,102,241,0.25)',
        // Dropdown
        dropBg: 'rgba(255,255,255,0.96)',
        dropBorder: '1px solid rgba(99,102,241,0.2)',
        dropShadow: '0 8px 40px rgba(99,102,241,0.22), 0 2px 8px rgba(0,0,0,0.06)',
        dropHeaderColor: 'rgba(100,116,139,0.7)',
        dropDivider: 'rgba(99,102,241,0.12)',
        dropItemColor: '#1e293b',
        dropActiveColor: '#4338ca',
        dropActiveBg: 'rgba(99,102,241,0.1)',
        dropActiveGlow: '0 0 12px rgba(99,102,241,0.2)',
        dropHoverBg: 'rgba(99,102,241,0.06)',
        swatchBorder: 'rgba(0,0,0,0.18)',
    } : {
        // Nav container
        navBg: 'rgba(255,255,255,0.055)',
        navBorder: '1px solid rgba(255,255,255,0.1)',
        navShadow: '0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        // Pill
        pillBg: 'rgba(255,255,255,0.14)',
        pillShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.45), 0 0 16px rgba(99,102,241,0.2)',
        // Tab text
        activeText: '#a5b4fc',
        inactiveText: 'rgba(148,163,184,0.75)',
        // Theme button
        btnBg: 'rgba(255,255,255,0.09)',
        btnBorder: '1px solid rgba(255,255,255,0.16)',
        btnColor: 'rgba(226,232,240,0.9)',
        btnShadow: '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        btnHoverShadow: '0 0 0 2px rgba(99,102,241,0.55), 0 0 24px rgba(99,102,241,0.3), 0 8px 24px rgba(0,0,0,0.4)',
        // Dropdown
        dropBg: 'rgba(12,16,30,0.9)',
        dropBorder: '1px solid rgba(255,255,255,0.1)',
        dropShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.35), 0 0 40px rgba(99,102,241,0.12)',
        dropHeaderColor: 'rgba(148,163,184,0.6)',
        dropDivider: 'rgba(99,102,241,0.2)',
        dropItemColor: 'rgba(203,213,225,0.9)',
        dropActiveColor: '#a5b4fc',
        dropActiveBg: 'rgba(99,102,241,0.18)',
        dropActiveGlow: '0 0 16px rgba(99,102,241,0.3)',
        dropHoverBg: 'rgba(255,255,255,0.05)',
        swatchBorder: 'rgba(255,255,255,0.2)',
    };

    return (
        <header
            className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 slide-in-down"
            style={{ position: 'relative', zIndex: 1000 }}
        >
            {/* ── Left: Logo + Tab Nav ── */}
            <div className="flex items-center gap-5">

                {/* Logo */}
                <div className="flex items-center gap-3 animate-in">
                    <img
                        src="/logo.svg" alt="Doclify"
                        fetchPriority="high" width="32" height="32"
                        className="w-8 h-8 logo-spin cursor-pointer"
                        style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                    />
                    <h1
                        className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
                        style={{ animation: 'fadeSlideUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                        Doclify
                    </h1>
                </div>

                {/* ── Sliding-pill Nav ── */}
                <nav
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '12px',
                        background: tokens.navBg,
                        border: tokens.navBorder,
                        boxShadow: tokens.navShadow,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        animation: 'fadeSlideUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both',
                    }}
                >
                    {/* Sliding pill */}
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: '4px', bottom: '4px',
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            borderRadius: '9px',
                            background: tokens.pillBg,
                            boxShadow: tokens.pillShadow,
                            transition: 'left 0.32s cubic-bezier(0.34,1.4,0.64,1), width 0.32s cubic-bezier(0.34,1.4,0.64,1), opacity 0.18s ease',
                            opacity: pillStyle.width > 0 ? 1 : 0,
                            pointerEvents: 'none',
                        }}
                    />

                    {TABS.map(({ path, label, exact }, i) => (
                        <NavLink
                            key={path} to={path} end={exact}
                            ref={el => { tabRefs.current[i] = el; }}
                            style={{ position: 'relative', zIndex: 1, textDecoration: 'none' }}
                            className={({ isActive }) =>
                                `px-5 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 select-none ${isActive ? '' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <span style={{
                                    color: isActive ? tokens.activeText : tokens.inactiveText,
                                    textShadow: isActive && !isLight
                                        ? '0 0 12px rgba(139,148,252,0.7), 0 0 24px rgba(99,102,241,0.4)'
                                        : isActive && isLight
                                            ? '0 0 8px rgba(99,102,241,0.3)'
                                            : 'none',
                                    transition: 'color 0.2s ease, text-shadow 0.2s ease',
                                    fontWeight: isActive ? 600 : 500,
                                }}>
                                    {label}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* ── Right: Editor Theme Picker ── */}
            <div
                ref={dropdownRef}
                style={{ position: 'relative', zIndex: 9999, animation: 'fadeSlideUp 0.4s 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
            >
                {/* Trigger button */}
                <ThemeButton
                    onClick={() => setOpen(o => !o)}
                    open={open}
                    label={currentTheme.label}
                    tokens={tokens}
                    isLight={isLight}
                />

                {/* Dropdown */}
                {open && (
                    <div
                        className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden scale-in"
                        style={{
                            background: tokens.dropBg,
                            backdropFilter: 'blur(48px) saturate(200%)',
                            WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                            border: tokens.dropBorder,
                            boxShadow: tokens.dropShadow,
                            zIndex: 9999,
                        }}
                    >
                        {/* Header label */}
                        <div style={{
                            padding: '10px 16px 9px',
                            fontSize: '0.68rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: tokens.dropHeaderColor,
                            borderBottom: `1px solid ${tokens.dropDivider}`,
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <span style={{ fontSize: '0.8rem' }}>🎨</span>
                            Editor Theme
                        </div>

                        {/* Items */}
                        <div style={{ padding: '6px' }}>
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
                                        onClick={() => { onEditorThemeChange(t.id); setOpen(false); }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

/* ── Sub-components ───────────────────────────────────────── */

function ThemeButton({ onClick, open, label, tokens, isLight }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            title="Change editor theme"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 14px', borderRadius: '12px',
                border: tokens.btnBorder,
                background: tokens.btnBg,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                color: tokens.btnColor,
                fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer',
                boxShadow: hovered ? tokens.btnHoverShadow : tokens.btnShadow,
                transform: pressed ? 'scale(0.96)' : hovered ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                outline: 'none',
            }}
        >
            <span style={{
                fontSize: '1rem',
                filter: hovered
                    ? isLight ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' : 'drop-shadow(0 0 8px rgba(139,148,252,0.7))'
                    : 'none',
                transition: 'filter 0.2s ease',
            }}>🎨</span>
            <span>{label}</span>
            <span style={{
                display: 'inline-block',
                transition: 'transform 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '0.65rem',
                opacity: 0.65,
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
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? tokens.dropActiveColor : tokens.dropItemColor,
                background: isActive ? tokens.dropActiveBg : hovered ? tokens.dropHoverBg : 'transparent',
                boxShadow: isActive ? tokens.dropActiveGlow : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderRadius: '10px',
                transition: 'all 0.15s ease',
            }}
        >
            {/* Colour swatch */}
            <span style={{
                width: '14px', height: '14px', borderRadius: '50%',
                background: swatchColor, flexShrink: 0,
                border: `1.5px solid ${tokens.swatchBorder}`,
                boxShadow: isActive ? `0 0 8px ${swatchColor}` : '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'box-shadow 0.2s ease',
            }} />
            <span style={{ flex: 1 }}>{label}</span>
            {isActive && (
                <span style={{
                    fontSize: '0.8rem',
                    color: tokens.dropActiveColor,
                    filter: 'drop-shadow(0 0 4px currentColor)',
                }}>✓</span>
            )}
        </button>
    );
}

