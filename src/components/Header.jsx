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
        if (el) {
            setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
        }
    }, [safeIndex]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentTheme = EDITOR_THEMES.find(t => t.id === editorTheme) || EDITOR_THEMES[1];

    // Adaptive styles
    const pillBg = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.13)';
    const pillShadow = isLight ? '0 2px 8px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.35)';
    const navBg = isLight ? 'rgba(220,225,255,0.45)' : 'rgba(255,255,255,0.05)';
    const navBorder = isLight ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.08)';
    const btnBg = isLight ? 'rgba(240,242,255,0.75)' : 'rgba(255,255,255,0.1)';
    const btnBorder = isLight ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.18)';
    const btnText = isLight ? '#3730a3' : 'rgba(255,255,255,0.9)';
    const dropdownBg = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,22,35,0.88)';
    const dropdownBorder = isLight ? 'rgba(100,120,180,0.18)' : 'rgba(255,255,255,0.1)';
    const headerText = isLight ? 'rgba(30,40,90,0.55)' : 'rgba(180,190,220,0.7)';
    const itemText = isLight ? '#2d3a5e' : 'rgba(210,220,240,0.9)';
    const itemHoverBg = isLight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.05)';
    const itemActiveBg = isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)';
    const itemActiveText = isLight ? '#4338ca' : '#818cf8';
    const dividerColor = isLight ? 'rgba(100,120,180,0.15)' : 'rgba(255,255,255,0.08)';

    return (
        <header
            className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 slide-in-down"
            style={{ position: 'relative', zIndex: 1000 }}
        >
            {/* Left: Logo + Sliding Tab Nav */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3 animate-in">
                    <img
                        src="/logo.svg"
                        alt="Doclify"
                        fetchPriority="high"
                        width="32"
                        height="32"
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

                {/* Sliding-pill Nav */}
                <nav
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        gap: '0px',
                        borderRadius: '10px',
                        background: navBg,
                        border: navBorder,
                        animation: 'fadeSlideUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both',
                    }}
                >
                    {/* Pill — sized by measuring the active tab, then faded in */}
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: '4px',
                            bottom: '4px',
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            borderRadius: '7px',
                            background: pillBg,
                            boxShadow: pillShadow,
                            transition: 'left 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.15s ease',
                            opacity: pillStyle.width > 0 ? 1 : 0,
                            pointerEvents: 'none',
                        }}
                    />

                    {TABS.map(({ path, label, exact }, i) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={exact}
                            ref={el => { tabRefs.current[i] = el; }}
                            style={{ position: 'relative', zIndex: 1, textDecoration: 'none' }}
                            className={({ isActive }) =>
                                `px-5 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                                    ? isLight ? 'text-indigo-700' : 'text-primary-400'
                                    : isLight ? 'text-slate-500 hover:text-slate-700' : 'text-dark-400 hover:text-dark-200'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Right: Editor Theme Picker */}
            <div
                ref={dropdownRef}
                style={{ position: 'relative', zIndex: 9999, animation: 'fadeSlideUp 0.4s 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
            >
                <button
                    onClick={() => setOpen(o => !o)}
                    title="Change editor theme"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 14px', borderRadius: '12px',
                        border: `1px solid ${btnBorder}`,
                        background: btnBg,
                        backdropFilter: 'blur(16px)',
                        color: btnText,
                        fontSize: '0.875rem', fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isLight ? '0 2px 8px rgba(99,102,241,0.1)' : '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                >
                    <span>🎨</span>
                    <span>{currentTheme.label}</span>
                    <span style={{
                        display: 'inline-block',
                        transition: 'transform 0.2s ease',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        fontSize: '0.7rem', opacity: 0.7,
                    }}>▾</span>
                </button>

                {open && (
                    <div
                        className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden scale-in"
                        style={{
                            background: dropdownBg,
                            backdropFilter: 'blur(48px) saturate(200%)',
                            WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                            border: `1px solid ${dropdownBorder}`,
                            boxShadow: isLight
                                ? '0 8px 40px rgba(99,102,241,0.18), 0 2px 12px rgba(0,0,0,0.08)'
                                : '0 8px 40px rgba(0,0,0,0.5), 0 2px 12px rgba(0,0,0,0.3)',
                            zIndex: 9999,
                        }}
                    >
                        <div style={{
                            padding: '10px 16px 8px',
                            fontSize: '0.7rem', fontWeight: '700',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: headerText,
                            borderBottom: `1px solid ${dividerColor}`,
                        }}>
                            Editor Theme
                        </div>

                        {EDITOR_THEMES.map((t) => {
                            const isActive = editorTheme === t.id;
                            const swatchColor = t.data
                                ? t.data.colors['editor.background']
                                : (t.id === 'vs-dark' ? '#1e1e1e' : '#ffffff');
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { onEditorThemeChange(t.id); setOpen(false); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 16px', fontSize: '0.875rem',
                                        fontWeight: isActive ? '600' : '400',
                                        color: isActive ? itemActiveText : itemText,
                                        background: isActive ? itemActiveBg : 'transparent',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = itemHoverBg; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{
                                        width: '14px', height: '14px', borderRadius: '50%',
                                        background: swatchColor, flexShrink: 0,
                                        border: isLight ? '1.5px solid rgba(0,0,0,0.2)' : '1.5px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    }} />
                                    {t.label}
                                    {isActive && <span style={{ marginLeft: 'auto', color: itemActiveText }}>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
}
