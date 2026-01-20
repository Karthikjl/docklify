import { useRef, useEffect } from 'react';
import { exportAsHTML, exportAsPDF, copyHTMLToClipboard, readFileAsText } from '../utils/exportUtils';
import { parseMarkdown } from '../utils/markdownParser';

export default function Toolbar({
    markdown,
    onMarkdownChange,
    theme,
    onThemeToggle,
    fontSize,
    onFontSizeChange,
    onClear,
    scrollSync,
    onScrollSyncToggle,
    aiMode,
    onAIModeToggle,
    onAISettings,
    onConvertToMarkdown,
    aiLoading
}) {
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.md')) {
            alert('Please upload a .md file');
            return;
        }

        try {
            const content = await readFileAsText(file);
            onMarkdownChange(content);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        }

        // Reset input
        event.target.value = '';
    };

    const handleExportHTML = () => {
        const html = parseMarkdown(markdown);
        exportAsHTML(html, 'document.html');
    };

    const handleExportPDF = async () => {
        const previewElement = document.querySelector('.markdown-preview');
        if (!previewElement) {
            alert('Preview not found');
            return;
        }

        try {
            await exportAsPDF(previewElement, 'document.pdf');
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting PDF. Please try again.');
        }
    };

    const handleCopyHTML = async () => {
        const html = parseMarkdown(markdown);
        try {
            await copyHTMLToClipboard(html);
            alert('HTML copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            alert('Error copying to clipboard');
        }
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

        if (!file.name.endsWith('.md')) {
            alert('Please drop a .md file');
            return;
        }

        try {
            const content = await readFileAsText(file);
            onMarkdownChange(content);
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
    }, []);

    return (
        <div className="glass border-b border-dark-200 dark:border-dark-700 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="AI Markdown Viewer" className="w-8 h-8" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        AI Markdown Viewer Online
                    </h1>
                </div>

                <div className="h-6 w-px bg-dark-300 dark:bg-dark-600" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary text-sm"
                        title="Upload .md file"
                    >
                        📁 Upload
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <button
                        onClick={handleExportHTML}
                        className="btn-secondary text-sm"
                        title="Export as HTML"
                    >
                        📄 HTML
                    </button>

                    <button
                        onClick={handleExportPDF}
                        className="btn-secondary text-sm"
                        title="Export as PDF"
                    >
                        📑 PDF
                    </button>

                    <button
                        onClick={handleCopyHTML}
                        className="btn-ghost text-sm"
                        title="Copy HTML"
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

                    {/* AI Convert Button - Only show when AI mode is ON */}
                    {aiMode && (
                        <button
                            onClick={onConvertToMarkdown}
                            disabled={aiLoading}
                            className="btn-primary text-sm flex items-center gap-2"
                            title="Convert plain text to Markdown using AI"
                        >
                            {aiLoading ? (
                                <>
                                    <span className="inline-block animate-spin">⚙️</span>
                                    Converting...
                                </>
                            ) : (
                                <>
                                    🪄 Convert to Markdown
                                </>
                            )}
                        </button>
                    )}
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

                {/* AI Mode Toggle */}
                <button
                    onClick={onAIModeToggle}
                    className={`btn-ghost ${aiMode ? 'text-primary-600 dark:text-primary-400' : 'text-dark-500 dark:text-dark-500'}`}
                    title={aiMode ? 'Disable AI Mode' : 'Enable AI Mode'}
                >
                    🤖
                </button>

                {/* AI Settings - Only show when AI mode is ON */}
                {aiMode && (
                    <button
                        onClick={onAISettings}
                        className="btn-ghost"
                        title="AI Settings"
                    >
                        ⚙️
                    </button>
                )}

                <button
                    onClick={onScrollSyncToggle}
                    className={`btn-ghost ${scrollSync ? 'text-primary-600 dark:text-primary-400' : 'text-dark-500 dark:text-dark-500'}`}
                    title={scrollSync ? 'Disable scroll sync' : 'Enable scroll sync'}
                >
                    {scrollSync ? '🔗' : '⛓️‍💥'}
                </button>

                <button
                    onClick={onThemeToggle}
                    className="btn-ghost"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );
}
