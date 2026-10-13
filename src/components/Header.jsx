'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWindowWidth } from '../hooks/useWindowWidth';
import ThemePicker from './ThemePicker';

const TABS = [
    { path: '/', label: 'Markdown', exact: true },
    { path: '/html', label: 'HTML', exact: false },
    { path: '/json', label: 'JSON', exact: false },
];

function Header({ editorTheme = 'vs-dark', onEditorThemeChange, theme = 'dark' }) {
    const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 });
    const tabRefs = useRef([]);
    const pathname = usePathname() || '/';
    const isLight = theme === 'light';
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    const activeIndex = TABS.findIndex(t =>
        t.exact ? pathname === t.path : pathname.startsWith(t.path)
    );
    const safeIndex = activeIndex === -1 ? 0 : activeIndex;

    useEffect(() => {
        const el = tabRefs.current[safeIndex];
        if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }, [safeIndex]);

    // Minimalist theme tokens (neutral zinc monochrome)
    const tokens = isLight ? {
        navBg: '#f4f4f5',
        navBorder: '1px solid #e4e4e7',
        navShadow: 'none',
        pillBg: '#ffffff',
        pillShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        activeText: '#09090b',
        inactiveText: '#71717a',
        btnBg: '#ffffff',
        btnBorder: '1px solid #e4e4e7',
        btnColor: '#18181b',
        btnShadow: 'none',
        btnHoverShadow: 'none',
        btnHoverBg: '#f4f4f5',
        dropBg: '#ffffff',
        dropBorder: '1px solid #e4e4e7',
        dropShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        dropHeaderColor: '#71717a',
        dropDivider: '#e4e4e7',
        dropItemColor: '#27272a',
        dropActiveColor: '#09090b',
        dropActiveBg: '#f4f4f5',
        dropActiveGlow: 'none',
        dropHoverBg: '#f4f4f5',
        swatchBorder: '#e4e4e7',
    } : {
        navBg: '#121215',
        navBorder: '1px solid #27272a',
        navShadow: 'none',
        pillBg: '#27272a',
        pillShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
        activeText: '#f4f4f5',
        inactiveText: '#a1a1aa',
        btnBg: '#121215',
        btnBorder: '1px solid #27272a',
        btnColor: '#e4e4e7',
        btnShadow: 'none',
        btnHoverShadow: 'none',
        btnHoverBg: '#1c1c20',
        dropBg: '#121215',
        dropBorder: '1px solid #27272a',
        dropShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        dropHeaderColor: '#71717a',
        dropDivider: '#27272a',
        dropItemColor: '#d4d4d8',
        dropActiveColor: '#ffffff',
        dropActiveBg: '#27272a',
        dropActiveGlow: 'none',
        dropHoverBg: '#1c1c20',
        swatchBorder: '#3f3f46',
    };

    return (
        <header
            className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]"
            style={{
                position: 'relative', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isMobile ? '8px 12px' : '10px 20px',
                gap: '8px',
            }}
        >
            {/* Left: Brand Identity */}
            <Link
                href="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '10px',
                    textDecoration: 'none',
                    flexShrink: 0,
                }}
            >
                <div style={{
                    width: isMobile ? '28px' : '32px',
                    height: isMobile ? '28px' : '32px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: isLight ? '1px solid #e4e4e7' : '1px solid #27272a',
                }}>
                    <svg
                        viewBox="0 0 100 100"
                        width="100%"
                        height="100%"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: '100%', height: '100%', display: 'block' }}
                        aria-label="Docklify Logo"
                        role="img"
                    >
                        <rect x="8" y="8" width="84" height="84" rx="20" fill={isLight ? '#18181b' : '#09090b'} />
                        <rect x="8.5" y="8.5" width="83" height="83" rx="19.5" stroke="#27272a" strokeWidth="1" />
                        <rect x="28" y="26" width="9" height="48" rx="4.5" fill="#f4f4f5" />
                        <path
                            d="M37 30.5 C54 30.5 68 39 68 50 C68 61 54 69.5 37 69.5"
                            stroke="#f4f4f5"
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <line x1="44" y1="46" x2="56" y2="46" stroke="#71717a" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="44" y1="54" x2="52" y2="54" stroke="#71717a" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                </div>

                <span
                    style={{
                        fontSize: isMobile ? '1.05rem' : '1.2rem',
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                        color: isLight ? '#09090b' : '#f4f4f5',
                        lineHeight: 1,
                    }}
                >
                    Docklify
                </span>
            </Link>

            {/* Center: Minimalist Navigation Tabs */}
            <div style={{
                position: isMobile ? 'static' : 'absolute',
                left: isMobile ? 'auto' : '50%',
                transform: isMobile ? 'none' : 'translateX(-50%)',
            }}>
                <nav style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px',
                    borderRadius: '8px',
                    background: tokens.navBg,
                    border: tokens.navBorder,
                }}>
                    {/* Sliding pill */}
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: '3px', bottom: '3px',
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            borderRadius: '6px',
                            background: tokens.pillBg,
                            boxShadow: tokens.pillShadow,
                            transition: 'left 0.22s ease, width 0.22s ease, opacity 0.15s ease',
                            opacity: pillStyle.width > 0 ? 1 : 0,
                            pointerEvents: 'none',
                        }}
                    />

                    {TABS.map(({ path, label, exact }, i) => {
                        const isActive = exact ? pathname === path : pathname.startsWith(path);
                        return (
                            <Link
                                key={path}
                                href={path}
                                ref={el => { tabRefs.current[i] = el; }}
                                style={{ position: 'relative', zIndex: 1, textDecoration: 'none' }}
                            >
                                <span style={{
                                    display: 'block',
                                    padding: isMobile ? '5px 10px' : '5px 16px',
                                    fontSize: '0.825rem',
                                    color: isActive ? tokens.activeText : tokens.inactiveText,
                                    fontWeight: isActive ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                    transition: 'color 0.15s ease',
                                }}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Theme Picker */}
            <ThemePicker
                editorTheme={editorTheme}
                onEditorThemeChange={onEditorThemeChange}
                tokens={tokens}
                isLight={isLight}
                isMobile={isMobile}
            />
        </header>
    );
}

export default memo(Header);

