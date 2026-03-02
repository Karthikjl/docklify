import { useRef, useEffect } from 'react';
import { readFileAsText } from '../utils/exportUtils';

export default function Toolbar({
    // Actions
    onUpload,
    onExportHTML,
    onExportPDF,
    onCopy,
    onClear,

    // Settings
    theme, onThemeToggle,
    fontSize, onFontSizeChange,
    scrollSync, onScrollSyncToggle,

    // AI
    aiMode, onAIModeToggle, onAISettings,
    aiLoading, onAiAction,

    // Configuration
    uploadAccept = ".md",
    aiActionLabel = "Convert"
}) {
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation based on accept prop
        if (uploadAccept && !file.name.endsWith(uploadAccept.replace('*', ''))) {
            // Lenient check or just let it pass user discretion
            // Using strict check for now if specific extension provided
            const ext = uploadAccept.split(',')[0].trim(); // simple check
            if (!file.name.toLowerCase().endsWith(ext.replace('*', ''))) {
                alert(`Please upload a ${ext} file`);
                return;
            }
        }

        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        }

        // Reset input
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Simple validation
        if (uploadAccept) {
            const ext = uploadAccept.split(',')[0].trim();
            if (!file.name.toLowerCase().endsWith(ext.replace('*', ''))) {
                alert(`Please drop a ${ext} file`);
                return;
            }
        }

        try {
            const content = await readFileAsText(file);
            onUpload(content);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        }
    };

    // Add drag and drop to document
    useEffect(() => {
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadAccept]);

    return (
        <div className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-3 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-4">
                {/* File Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary text-sm"
                        title={`Upload ${uploadAccept} file`}
                    >
                        📁 Upload
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={uploadAccept}
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <button
                        onClick={onExportHTML}
                        className="btn-secondary text-sm"
                        title="Export as HTML"
                    >
                        📄 HTML
                    </button>

                    <button
                        onClick={onExportPDF}
                        className="btn-secondary text-sm"
                        title="Export as PDF"
                    >
                        📑 PDF
                    </button>

                    <button
                        onClick={onCopy}
                        className="btn-ghost text-sm"
                        title="Copy content"
                    >
                        📋 Copy
                    </button>

                    <button
                        onClick={onClear}
                        className="btn-ghost text-sm text-red-600 dark:text-red-400"
                        title="Clear content"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-dark-600 dark:text-dark-400">Size:</label>
                    <button
                        onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
                        className="btn-ghost text-sm px-2 py-1"
                        title="Decrease font size"
                    >
                        A-
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{fontSize}</span>
                    <button
                        onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
                        className="btn-ghost text-sm px-2 py-1"
                        title="Increase font size"
                    >
                        A+
                    </button>
                </div>

                <div className="h-6 w-px bg-dark-300 dark:bg-dark-600" />

                {/* AI Mode Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onAIModeToggle}
                        className={`touch-target p-2 rounded-lg transition-all duration-200 ${aiMode
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 dark:text-dark-500'
                            }`}
                        title={aiMode ? 'Disable AI Mode' : 'Enable AI Mode'}
                    >
                        🤖
                    </button>

                    {/* AI Settings - Always visible when AI mode is ON */}
                    {aiMode && (
                        <>
                            <button
                                onClick={onAISettings}
                                className="touch-target p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200 text-dark-600 dark:text-dark-400"
                                title="AI Settings"
                            >
                                ⚙️
                            </button>

                            {/* AI Action Button (Convert/Explain) */}
                            <button
                                onClick={onAiAction}
                                disabled={aiLoading}
                                className="glass-button px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title="Run AI Action"
                            >
                                {aiLoading ? (
                                    <>
                                        <span className="inline-block animate-spin">⚙️</span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        🪄 {aiActionLabel}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={onScrollSyncToggle}
                    className={`touch-target p-2 rounded-lg transition-all duration-200 ${scrollSync
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 dark:text-dark-500'
                        }`}
                    title={scrollSync ? 'Disable scroll sync' : 'Enable scroll sync'}
                >
                    {scrollSync ? '🔗' : '⛓️‍💥'}
                </button>

                <button
                    onClick={onThemeToggle}
                    className="touch-target p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200 text-dark-600 dark:text-dark-400"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );
}

