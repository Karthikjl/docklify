import { useRef, useEffect } from 'react';
import { readFileAsText } from '../utils/exportUtils';

export default function Toolbar({
    onUpload, onExportHTML, onExportPDF, onCopy, onClear,
    theme, onThemeToggle,
    fontSize, onFontSizeChange,
    scrollSync, onScrollSyncToggle,
    showScrollSync = true,
    aiMode, onAIModeToggle, onAISettings,
    aiLoading, onAiAction,
    uploadAccept = ".md",
    aiActionLabel = "Convert"
}) {
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) {
            console.error('Error reading file:', error);
        }
        event.target.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
        return () => {
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [uploadAccept]);

    // Staggered animation style helper
    const stagger = (i) => ({
        animation: `fadeSlideUp 0.4s ${0.05 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`
    });

    return (
        <div className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-3 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:gap-4 toolbar-enter">
            {/* Left: File controls */}
            <div className="flex items-center gap-2">
                {[
                    { icon: '📁', label: 'Upload',  onClick: () => fileInputRef.current?.click(), cls: 'btn-secondary' },
                    { icon: '📄', label: 'HTML',    onClick: onExportHTML,  cls: 'btn-secondary' },
                    { icon: '📑', label: 'PDF',     onClick: onExportPDF,   cls: 'btn-secondary' },
                    { icon: '📋', label: 'Copy',    onClick: onCopy,        cls: 'btn-ghost' },
                    { icon: '🗑️', label: 'Clear',  onClick: onClear,       cls: 'btn-ghost text-red-600 dark:text-red-400' },
                ].map(({ icon, label, onClick, cls }, i) => (
                    <button
                        key={label}
                        onClick={onClick}
                        className={`${cls} text-sm btn-press hover-lift`}
                        title={label}
                        style={stagger(i)}
                    >
                        {icon} {label}
                    </button>
                ))}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadAccept}
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* Right: Settings */}
            <div className="flex items-center gap-3" style={stagger(5)}>
                {/* Font size */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-dark-600 dark:text-dark-400">Size:</label>
                    <button
                        onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
                        className="btn-ghost text-sm px-2 py-1 btn-press"
                        title="Decrease font size"
                    >A-</button>
                    <span
                        className="text-sm font-medium w-8 text-center stat-number"
                        key={fontSize}
                        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
                    >
                        {fontSize}
                    </span>
                    <button
                        onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
                        className="btn-ghost text-sm px-2 py-1 btn-press"
                        title="Increase font size"
                    >A+</button>
                </div>

                <div className="h-6 w-px bg-dark-300 dark:bg-dark-600" />

                {/* AI Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onAIModeToggle}
                        className={`touch-target p-2 rounded-lg transition-all duration-200 btn-press ${
                            aiMode
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 pulse-glow'
                                : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500'
                        }`}
                        title={aiMode ? 'Disable AI Mode' : 'Enable AI Mode'}
                    >
                        🤖
                    </button>

                    {aiMode && (
                        <div className="flex items-center gap-2 scale-in">
                            <button
                                onClick={onAISettings}
                                className="touch-target p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200 btn-press"
                                title="AI Settings"
                                style={{ animation: 'scaleIn 0.25s 0.05s cubic-bezier(0.34,1.56,0.64,1) both' }}
                            >
                                ⚙️
                            </button>
                            <button
                                onClick={onAiAction}
                                disabled={aiLoading}
                                className="glass-button px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 btn-press"
                                style={{ animation: 'scaleIn 0.25s 0.1s cubic-bezier(0.34,1.56,0.64,1) both' }}
                            >
                                {aiLoading ? (
                                    <>
                                        <span style={{ display: 'inline-block', animation: 'spin360 1s linear infinite' }}>⚙️</span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>🪄 {aiActionLabel}</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Scroll sync */}
                {showScrollSync && (
                    <button
                        onClick={onScrollSyncToggle}
                        className={`touch-target p-2 rounded-lg transition-all duration-200 btn-press scale-in ${
                            scrollSync
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500'
                        }`}
                        title={scrollSync ? 'Disable scroll sync' : 'Enable scroll sync'}
                    >
                        {scrollSync ? '🔗' : '⛓️‍💥'}
                    </button>
                )}

                {/* Theme toggle */}
                <button
                    onClick={onThemeToggle}
                    className="touch-target p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200 btn-press hover-lift"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    style={{ animation: 'fadeSlideUp 0.4s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
                >
                    <span style={{ display: 'inline-block', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </span>
                </button>
            </div>
        </div>
    );
}
