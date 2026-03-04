import { useRef, useEffect, useState } from 'react';
import { readFileAsText } from '../utils/exportUtils';

// ── Theme token system (mirrors Header.jsx) ──────────────────
function useTokens(isLight) {
    return isLight ? {
        // Regular action buttons (Upload, HTML, PDF, Copy)
        btnBg: 'rgba(238,241,255,0.80)',
        btnBorder: '1px solid rgba(99,102,241,0.25)',
        btnColor: '#3730a3',
        btnShadow: '0 2px 8px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        btnHoverShadow: '0 4px 18px rgba(99,102,241,0.30), 0 0 0 2px rgba(99,102,241,0.2)',
        btnHoverBg: 'rgba(224,231,255,0.95)',
        // Clear button
        clearBg: 'rgba(255,241,241,0.85)',
        clearBorder: '1px solid rgba(239,68,68,0.25)',
        clearColor: '#b91c1c',
        clearShadow: '0 2px 8px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
        clearHoverShadow: '0 4px 18px rgba(239,68,68,0.30), 0 0 0 2px rgba(239,68,68,0.2)',
        clearHoverBg: 'rgba(254,226,226,0.95)',
        // Icon buttons (AI, sync, theme)
        iconBg: 'transparent',
        iconBorder: '1px solid transparent',
        iconColor: '#475569',
        iconHoverBg: 'rgba(99,102,241,0.09)',
        iconHoverBorder: '1px solid rgba(99,102,241,0.2)',
        iconHoverColor: '#4338ca',
        iconHoverShadow: '0 2px 10px rgba(99,102,241,0.18)',
        // Active icon (AI on, scroll sync on)
        iconActiveBg: 'rgba(99,102,241,0.12)',
        iconActiveBorder: '1px solid rgba(99,102,241,0.3)',
        iconActiveColor: '#4338ca',
        iconActiveShadow: '0 0 12px rgba(99,102,241,0.25)',
        // Font size label
        labelColor: '#64748b',
        sizeColor: '#1e293b',
        // Divider
        divider: 'rgba(99,102,241,0.15)',
        // AI action button
        aiBg: 'rgba(99,102,241,0.12)',
        aiBorder: '1px solid rgba(99,102,241,0.3)',
        aiColor: '#4338ca',
        aiShadow: '0 2px 10px rgba(99,102,241,0.2)',
        aiHoverShadow: '0 4px 20px rgba(99,102,241,0.35), 0 0 0 2px rgba(99,102,241,0.25)',
    } : {
        // Regular action buttons
        btnBg: 'rgba(255,255,255,0.07)',
        btnBorder: '1px solid rgba(255,255,255,0.13)',
        btnColor: 'rgba(226,232,240,0.9)',
        btnShadow: '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        btnHoverShadow: '0 0 0 2px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.22), 0 6px 20px rgba(0,0,0,0.35)',
        btnHoverBg: 'rgba(255,255,255,0.12)',
        // Clear button
        clearBg: 'rgba(255,255,255,0.07)',
        clearBorder: '1px solid rgba(239,68,68,0.25)',
        clearColor: '#f87171',
        clearShadow: '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        clearHoverShadow: '0 0 0 2px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.25), 0 6px 20px rgba(0,0,0,0.35)',
        clearHoverBg: 'rgba(239,68,68,0.1)',
        // Icon buttons
        iconBg: 'transparent',
        iconBorder: '1px solid transparent',
        iconColor: 'rgba(148,163,184,0.8)',
        iconHoverBg: 'rgba(255,255,255,0.07)',
        iconHoverBorder: '1px solid rgba(255,255,255,0.13)',
        iconHoverColor: 'rgba(226,232,240,0.95)',
        iconHoverShadow: '0 0 14px rgba(99,102,241,0.22), 0 2px 8px rgba(0,0,0,0.3)',
        // Active icon
        iconActiveBg: 'rgba(99,102,241,0.18)',
        iconActiveBorder: '1px solid rgba(99,102,241,0.45)',
        iconActiveColor: '#a5b4fc',
        iconActiveShadow: '0 0 16px rgba(99,102,241,0.35)',
        // Font size label
        labelColor: 'rgba(148,163,184,0.7)',
        sizeColor: 'rgba(226,232,240,0.9)',
        // Divider
        divider: 'rgba(255,255,255,0.1)',
        // AI action button
        aiBg: 'rgba(99,102,241,0.18)',
        aiBorder: '1px solid rgba(99,102,241,0.45)',
        aiColor: '#a5b4fc',
        aiShadow: '0 2px 10px rgba(99,102,241,0.25)',
        aiHoverShadow: '0 0 0 2px rgba(99,102,241,0.55), 0 0 24px rgba(99,102,241,0.3)',
    };
}

// Regular toolbar button (Upload, HTML, PDF, Copy, Clear)
function ToolBtn({ icon, label, onClick, isLight, tokens, isClear }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const bg = isClear ? (hovered ? tokens.clearHoverBg : tokens.clearBg) : (hovered ? tokens.btnHoverBg : tokens.btnBg);
    const border = isClear ? tokens.clearBorder : tokens.btnBorder;
    const color = isClear ? tokens.clearColor : tokens.btnColor;
    const shadow = isClear ? (hovered ? tokens.clearHoverShadow : tokens.clearShadow) : (hovered ? tokens.btnHoverShadow : tokens.btnShadow);

    return (
        <button
            onClick={onClick}
            title={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 13px', borderRadius: '11px',
                border, background: bg, color,
                fontSize: '0.83rem', fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: shadow,
                transform: pressed ? 'scale(0.95)' : hovered ? 'translateY(-1px)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            <span style={{
                fontSize: '0.95rem',
                filter: hovered
                    ? isClear
                        ? 'drop-shadow(0 0 6px rgba(239,68,68,0.7))'
                        : isLight
                            ? 'drop-shadow(0 0 5px rgba(99,102,241,0.5))'
                            : 'drop-shadow(0 0 7px rgba(139,148,252,0.7))'
                    : 'none',
                transition: 'filter 0.18s ease',
            }}>{icon}</span>
            {label}
        </button>
    );
}

// Icon-only button (AI toggle, scroll sync, settings, theme)
function IconBtn({ children, onClick, title, isActive, tokens, isLight }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const active = isActive ?? false;

    return (
        <button
            onClick={onClick}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                border: active ? tokens.iconActiveBorder : hovered ? tokens.iconHoverBorder : tokens.iconBorder,
                background: active ? tokens.iconActiveBg : hovered ? tokens.iconHoverBg : tokens.iconBg,
                color: active ? tokens.iconActiveColor : hovered ? tokens.iconHoverColor : tokens.iconColor,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: active ? tokens.iconActiveShadow : hovered ? tokens.iconHoverShadow : 'none',
                transform: pressed ? 'scale(0.90)' : hovered ? 'translateY(-1px)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                outline: 'none',
            }}
        >
            {children}
        </button>
    );
}

export default function Toolbar({
    onUpload, onExportHTML, onExportPDF, onCopy, onClear,
    theme, onThemeToggle,
    fontSize, onFontSizeChange,
    scrollSync, onScrollSyncToggle,
    showScrollSync = true,
    aiMode, onAIModeToggle, onAISettings,
    aiLoading, onAiAction,
    uploadAccept = '.md',
    aiActionLabel = 'Convert'
}) {
    const fileInputRef = useRef(null);
    const isLight = theme === 'light';
    const tokens = useTokens(isLight);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) { console.error('Error reading file:', error); }
        event.target.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = async (e) => {
        e.preventDefault(); e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) { console.error('Error reading file:', error); }
    };

    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
        return () => {
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [uploadAccept]);

    const stagger = (i) => ({ animation: `fadeSlideUp 0.4s ${0.05 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both` });

    return (
        <div className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-3 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:gap-4 toolbar-enter">

            {/* ── Left: File action buttons ── */}
            <div className="flex items-center gap-2">
                {[
                    { icon: '📁', label: 'Upload', onClick: () => fileInputRef.current?.click(), isClear: false },
                    { icon: '📄', label: 'HTML', onClick: onExportHTML, isClear: false },
                    { icon: '📑', label: 'PDF', onClick: onExportPDF, isClear: false },
                    { icon: '📋', label: 'Copy', onClick: onCopy, isClear: false },
                    { icon: '🗑️', label: 'Clear', onClick: onClear, isClear: true },
                ].map(({ icon, label, onClick, isClear }, i) => (
                    <div key={label} style={stagger(i)}>
                        <ToolBtn
                            icon={icon} label={label} onClick={onClick}
                            isLight={isLight} tokens={tokens} isClear={isClear}
                        />
                    </div>
                ))}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadAccept}
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* ── Right: Settings ── */}
            <div className="flex items-center gap-3" style={stagger(5)}>

                {/* Font Size */}
                <div className="flex items-center gap-1">
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, color: tokens.labelColor, marginRight: '2px' }}>
                        Size:
                    </span>
                    <IconBtn onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))} title="Decrease font size" tokens={tokens} isLight={isLight}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>A-</span>
                    </IconBtn>
                    <span style={{
                        fontSize: '0.88rem', fontWeight: 700,
                        color: tokens.sizeColor,
                        width: '28px', textAlign: 'center',
                        animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
                    }}>
                        {fontSize}
                    </span>
                    <IconBtn onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))} title="Increase font size" tokens={tokens} isLight={isLight}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>A+</span>
                    </IconBtn>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '24px', background: tokens.divider, flexShrink: 0 }} />

                {/* AI Controls */}
                <div className="flex items-center gap-2">
                    <IconBtn
                        onClick={onAIModeToggle}
                        title={aiMode ? 'Disable AI Mode' : 'Enable AI Mode'}
                        isActive={aiMode} tokens={tokens} isLight={isLight}
                    >
                        🤖
                    </IconBtn>

                    {aiMode && (
                        <div className="flex items-center gap-2 scale-in">
                            <IconBtn
                                onClick={onAISettings}
                                title="AI Settings"
                                tokens={tokens} isLight={isLight}
                            >
                                ⚙️
                            </IconBtn>

                            {/* AI Action button */}
                            <AIActionBtn
                                onClick={onAiAction}
                                loading={aiLoading}
                                label={aiActionLabel}
                                tokens={tokens} isLight={isLight}
                            />
                        </div>
                    )}
                </div>

                {/* Scroll Sync */}
                {showScrollSync && (
                    <IconBtn
                        onClick={onScrollSyncToggle}
                        title={scrollSync ? 'Disable scroll sync' : 'Enable scroll sync'}
                        isActive={scrollSync} tokens={tokens} isLight={isLight}
                    >
                        {scrollSync ? '🔗' : '⛓️‍💥'}
                    </IconBtn>
                )}

                {/* Theme Toggle */}
                <IconBtn
                    onClick={onThemeToggle}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    tokens={tokens} isLight={isLight}
                >
                    <span style={{ display: 'inline-block', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </span>
                </IconBtn>
            </div>
        </div>
    );
}

// AI "Convert / Fix" button
function AIActionBtn({ onClick, loading, label, tokens, isLight }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            disabled={loading}
            title={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '11px',
                border: tokens.aiBorder,
                background: tokens.aiBg,
                color: tokens.aiColor,
                fontSize: '0.83rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: hovered && !loading ? tokens.aiHoverShadow : tokens.aiShadow,
                transform: pressed ? 'scale(0.95)' : hovered && !loading ? 'translateY(-1px)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                outline: 'none',
                animation: 'scaleIn 0.25s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
        >
            {loading ? (
                <>
                    <span style={{ display: 'inline-block', animation: 'spin360 1s linear infinite' }}>⚙️</span>
                    <span>Processing…</span>
                </>
            ) : (
                <>
                    <span style={{
                        filter: hovered ? (isLight ? 'drop-shadow(0 0 5px rgba(99,102,241,0.6))' : 'drop-shadow(0 0 7px rgba(165,180,252,0.8))') : 'none',
                        transition: 'filter 0.18s ease',
                    }}>🪄</span>
                    {label}
                </>
            )}
        </button>
    );
}

