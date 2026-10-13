'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { readFileAsText } from '../utils/exportUtils';
import { ToolBtn, IconBtn } from './ToolbarButtons';
import {
    UploadIcon,
    HtmlIcon,
    PdfIcon,
    CopyIcon,
    TrashIcon,
    BotIcon,
    SettingsIcon,
    SparklesIcon,
    SyncIcon,
    UnsyncIcon,
    SunIcon,
    MoonIcon,
} from './Icons';

// ── Minimalist theme tokens (neutral zinc monochrome) ─────────
function useTokens(isLight) {
    return isLight ? {
        // Regular action buttons (Upload, HTML, PDF, Copy)
        btnBg: '#ffffff',
        btnBorder: '1px solid #e4e4e7',
        btnColor: '#27272a',
        btnHoverBg: '#f4f4f5',
        // Clear button
        clearBg: '#ffffff',
        clearBorder: '1px solid #fecaca',
        clearColor: '#dc2626',
        clearHoverBg: '#fef2f2',
        // Icon buttons (AI, sync, theme)
        iconBg: 'transparent',
        iconBorder: '1px solid transparent',
        iconColor: '#71717a',
        iconHoverBg: '#f4f4f5',
        iconHoverBorder: '1px solid #e4e4e7',
        iconHoverColor: '#18181b',
        // Active icon (AI on, scroll sync on)
        iconActiveBg: '#e4e4e7',
        iconActiveBorder: '1px solid #d4d4d8',
        iconActiveColor: '#09090b',
        // Font size label
        labelColor: '#71717a',
        sizeColor: '#18181b',
        // Divider
        divider: '#e4e4e7',
        // AI action button
        aiBg: '#18181b',
        aiBorder: '1px solid #18181b',
        aiColor: '#ffffff',
        aiHoverBg: '#27272a',
    } : {
        // Regular action buttons
        btnBg: '#121215',
        btnBorder: '1px solid #27272a',
        btnColor: '#d4d4d8',
        btnHoverBg: '#1c1c20',
        // Clear button
        clearBg: '#121215',
        clearBorder: '1px solid rgba(239,68,68,0.25)',
        clearColor: '#f87171',
        clearHoverBg: 'rgba(239,68,68,0.1)',
        // Icon buttons
        iconBg: 'transparent',
        iconBorder: '1px solid transparent',
        iconColor: '#a1a1aa',
        iconHoverBg: '#1c1c20',
        iconHoverBorder: '1px solid #27272a',
        iconHoverColor: '#f4f4f5',
        // Active icon
        iconActiveBg: '#27272a',
        iconActiveBorder: '1px solid #3f3f46',
        iconActiveColor: '#ffffff',
        // Font size label
        labelColor: '#71717a',
        sizeColor: '#f4f4f5',
        // Divider
        divider: '#27272a',
        // AI action button
        aiBg: '#27272a',
        aiBorder: '1px solid #3f3f46',
        aiColor: '#f4f4f5',
        aiHoverBg: '#3f3f46',
    };
}

function Toolbar({
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

    const handleDrop = useCallback(async (e) => {
        e.preventDefault(); e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) { console.error('Error reading file:', error); }
    }, [onUpload]);

    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
        return () => {
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [uploadAccept, handleDrop]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] px-3 md:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">

            {/* ── Left: File action buttons ── */}
            <div className="flex items-center gap-1.5">
                <ToolBtn
                    icon={<UploadIcon size={14} />}
                    label="Upload"
                    onClick={handleUploadClick}
                    tokens={tokens}
                    isClear={false}
                />
                <ToolBtn
                    icon={<HtmlIcon size={14} />}
                    label="HTML"
                    onClick={onExportHTML}
                    tokens={tokens}
                    isClear={false}
                />
                <ToolBtn
                    icon={<PdfIcon size={14} />}
                    label="PDF"
                    onClick={onExportPDF}
                    tokens={tokens}
                    isClear={false}
                />
                <ToolBtn
                    icon={<CopyIcon size={14} />}
                    label="Copy"
                    onClick={onCopy}
                    tokens={tokens}
                    isClear={false}
                />
                <ToolBtn
                    icon={<TrashIcon size={14} />}
                    label="Clear"
                    onClick={onClear}
                    tokens={tokens}
                    isClear={true}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadAccept}
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* ── Right: Settings ── */}
            <div className="flex items-center gap-2.5">

                {/* Font Size */}
                <div className="flex items-center gap-1">
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.labelColor, marginRight: '2px' }}>
                        Size:
                    </span>
                    <IconBtn onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))} title="Decrease font size" tokens={tokens}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>A-</span>
                    </IconBtn>
                    <span style={{
                        fontSize: '0.8125rem', fontWeight: 600,
                        color: tokens.sizeColor,
                        width: '24px', textAlign: 'center',
                    }}>
                        {fontSize}
                    </span>
                    <IconBtn onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))} title="Increase font size" tokens={tokens}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>A+</span>
                    </IconBtn>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '18px', background: tokens.divider, flexShrink: 0 }} />

                {/* AI Controls */}
                <div className="flex items-center gap-1.5">
                    <IconBtn
                        onClick={onAIModeToggle}
                        title={aiMode ? 'Disable AI Mode' : 'Enable AI Mode'}
                        isActive={aiMode} tokens={tokens}
                    >
                        <BotIcon size={15} />
                    </IconBtn>

                    {aiMode && (
                        <div className="flex items-center gap-1.5">
                            <IconBtn
                                onClick={onAISettings}
                                title="AI Settings"
                                tokens={tokens}
                            >
                                <SettingsIcon size={15} />
                            </IconBtn>

                            {/* AI Action button */}
                            <AIActionBtn
                                onClick={onAiAction}
                                loading={aiLoading}
                                label={aiActionLabel}
                                tokens={tokens}
                            />
                        </div>
                    )}
                </div>

                {/* Scroll Sync */}
                {showScrollSync && (
                    <IconBtn
                        onClick={onScrollSyncToggle}
                        title={scrollSync ? 'Disable scroll sync' : 'Enable scroll sync'}
                        isActive={scrollSync} tokens={tokens}
                    >
                        {scrollSync ? <SyncIcon size={15} /> : <UnsyncIcon size={15} />}
                    </IconBtn>
                )}

                {/* Theme Toggle */}
                <IconBtn
                    onClick={onThemeToggle}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    tokens={tokens}
                >
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)',
                    }}>
                        {theme === 'dark' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
                    </span>
                </IconBtn>
            </div>
        </div>
    );
}

// Minimalist AI "Convert / Fix" button
function AIActionBtn({ onClick, loading, label, tokens }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            disabled={loading}
            aria-label={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 11px',
                borderRadius: '7px',
                border: tokens.aiBorder,
                background: hovered && !loading ? tokens.aiHoverBg : tokens.aiBg,
                color: tokens.aiColor,
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: 'none',
                transform: pressed ? 'scale(0.97)' : 'none',
                transition: 'background 0.15s ease, border-color 0.15s ease',
                outline: 'none',
            }}
        >
            {loading ? (
                <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                        <SparklesIcon size={13} />
                    </span>
                    <span>Processing…</span>
                </>
            ) : (
                <>
                    <SparklesIcon size={13} />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}

export default memo(Toolbar);
