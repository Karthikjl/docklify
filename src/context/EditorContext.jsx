'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useToast } from '../components/Toast';
import {
    loadMarkdown,
    saveMarkdown,
    loadTheme,
    saveTheme,
    loadFontSize,
    saveFontSize,
    loadHTMLContent,
    saveHTMLContent,
    loadJSONContent,
    saveJSONContent
} from '../utils/storageUtils';
import { loadAIMode, saveAIMode, loadProvider, loadApiKey } from '../utils/aiStorage';
import { DEFAULT_EDITOR_THEME } from '../utils/editorThemes';
import { convertToMarkdown, fixHTML, fixJSON } from '../utils/aiService';
import { exportAsHTML, exportAsPDF, exportHTMLAsPDF, copyHTMLToClipboard } from '../utils/exportUtils';
import { renderMarkdown } from '../renderers/markdownRenderer';
import { renderJSON } from '../renderers/jsonRenderer';
import { DEFAULT_MARKDOWN, DEFAULT_HTML, DEFAULT_JSON } from '../utils/defaultContent';

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
    const pathname = usePathname() || '/';
    const { toasts, removeToast, toast } = useToast();

    // Shared State
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState(16);
    const [scrollSync, setScrollSync] = useState(true);
    const [editorTheme, setEditorTheme] = useState(DEFAULT_EDITOR_THEME);

    // Content State
    const [markdown, setMarkdown] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [jsonContent, setJsonContent] = useState('');

    // AI State
    const [aiMode, setAiMode] = useState(false);
    const [aiProvider, setAiProvider] = useState('gemini');
    const [aiApiKey, setAiApiKey] = useState('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    // Determine current format based on pathname
    const currentFormat = pathname === '/html' ? 'html' : pathname === '/json' ? 'json' : 'markdown';

    // Initial load from storage on client mount
    useEffect(() => {
        const savedMarkdown = loadMarkdown();
        const savedHTML = loadHTMLContent();
        const savedJSON = loadJSONContent();

        setMarkdown(savedMarkdown || DEFAULT_MARKDOWN);
        setHtmlContent(savedHTML || DEFAULT_HTML);
        setJsonContent(savedJSON || DEFAULT_JSON);

        const savedTheme = loadTheme();
        setTheme(savedTheme);
        setFontSize(loadFontSize());
        setAiMode(loadAIMode());
        setAiProvider(loadProvider());
        setAiApiKey(loadApiKey());

        const savedEditorTheme = localStorage.getItem('doclify-editor-theme');
        if (savedEditorTheme) {
            setEditorTheme(savedEditorTheme);
        }

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Auto-save markdown
    useEffect(() => {
        if (!markdown) return;
        const timer = setTimeout(() => saveMarkdown(markdown), 500);
        return () => clearTimeout(timer);
    }, [markdown]);

    // Auto-save HTML
    useEffect(() => {
        if (!htmlContent) return;
        const timer = setTimeout(() => saveHTMLContent(htmlContent), 500);
        return () => clearTimeout(timer);
    }, [htmlContent]);

    // Auto-save JSON
    useEffect(() => {
        if (!jsonContent) return;
        const timer = setTimeout(() => saveJSONContent(jsonContent), 500);
        return () => clearTimeout(timer);
    }, [jsonContent]);

    // Theme toggle with circular expand animation from icon to full page
    const handleThemeToggle = useCallback((event) => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        const isAppearanceTransition =
            typeof document !== 'undefined' &&
            'startViewTransition' in document &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!isAppearanceTransition) {
            setTheme(newTheme);
            saveTheme(newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return;
        }

        let x = event?.clientX;
        let y = event?.clientY;

        // If triggered via keyboard or coordinates are 0, find the button's position
        if ((x === undefined || y === undefined || (x === 0 && y === 0)) && event?.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        } else if (x === undefined || y === undefined || (x === 0 && y === 0)) {
            x = window.innerWidth - 48;
            y = 48;
        }

        // Generous padding (+60px) ensures circle cleanly clears all screen corners
        const endRadius = Math.ceil(Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )) + 60;

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme);
                saveTheme(newTheme);
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            });
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${Math.round(x)}px ${Math.round(y)}px)`,
                        `circle(${endRadius}px at ${Math.round(x)}px ${Math.round(y)}px)`
                    ],
                },
                {
                    duration: 450,
                    easing: 'ease-out',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });
    }, [theme]);

    const handleFontSizeChange = useCallback((size) => {
        setFontSize(size);
        saveFontSize(size);
    }, []);

    const handleEditorThemeChange = useCallback((t) => {
        setEditorTheme(t);
        if (typeof window !== 'undefined') {
            localStorage.setItem('doclify-editor-theme', t);
        }
    }, []);

    // Upload content
    const handleUpload = useCallback((content) => {
        if (currentFormat === 'html') {
            setHtmlContent(content);
        } else if (currentFormat === 'json') {
            setJsonContent(content);
        } else {
            setMarkdown(content);
            saveMarkdown(content);
        }
    }, [currentFormat]);

    // Export HTML
    const handleExportHTML = useCallback(() => {
        let contentToExport = '';
        const filename = 'document.html';

        if (currentFormat === 'html') {
            contentToExport = htmlContent;
        } else if (currentFormat === 'json') {
            contentToExport = renderJSON(jsonContent);
        } else {
            contentToExport = renderMarkdown(markdown);
        }
        exportAsHTML(contentToExport, filename);
    }, [currentFormat, htmlContent, jsonContent, markdown]);

    // Export PDF
    const handleExportPDF = useCallback(async () => {
        try {
            if (currentFormat === 'html') {
                await exportHTMLAsPDF(htmlContent, 'document.pdf');
                toast.success('PDF exported successfully!', 'Export');
                return;
            } else if (currentFormat === 'json') {
                const temp = document.createElement('div');
                temp.innerHTML = renderJSON(jsonContent);
                await exportAsPDF(temp, 'document.pdf');
            } else {
                const previewElement = document.querySelector('.markdown-preview');
                if (!previewElement) {
                    toast.error('Markdown preview not found.', 'Export Error');
                    return;
                }
                await exportAsPDF(previewElement, 'document.pdf');
            }
            toast.success('PDF exported successfully!', 'Export');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF. Please try again.', 'Export Error');
        }
    }, [currentFormat, htmlContent, jsonContent, toast]);

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        let contentToCopy = '';
        if (currentFormat === 'html') contentToCopy = htmlContent;
        else if (currentFormat === 'json') contentToCopy = renderJSON(jsonContent);
        else contentToCopy = renderMarkdown(markdown);

        try {
            await copyHTMLToClipboard(contentToCopy);
            toast.success('Content copied to clipboard!', 'Copied');
        } catch (error) {
            console.error('Copy error:', error);
            toast.error('Failed to copy. Please try again.', 'Copy Error');
        }
    }, [currentFormat, htmlContent, jsonContent, markdown, toast]);

    // Clear content
    const handleClear = useCallback(() => {
        setShowConfirmClear(true);
    }, []);

    const handleConfirmClear = useCallback(() => {
        if (currentFormat === 'html') setHtmlContent('');
        else if (currentFormat === 'json') setJsonContent('');
        else setMarkdown('');
        setShowConfirmClear(false);
        toast.success('Editor cleared.', 'Cleared');
    }, [currentFormat, toast]);

    // AI Action
    const handleAiAction = useCallback(async () => {
        if (!aiApiKey) {
            setShowAISettings(true);
            return;
        }

        if (currentFormat === 'markdown' && !markdown.trim()) {
            toast.warning('Enter some text first.', 'Nothing to convert');
            return;
        }
        if (currentFormat === 'html' && !htmlContent.trim()) {
            toast.warning('Enter some HTML first.', 'Nothing to fix');
            return;
        }
        if (currentFormat === 'json' && !jsonContent.trim()) {
            toast.warning('Enter some JSON first.', 'Nothing to fix');
            return;
        }

        setAiLoading(true);
        try {
            if (currentFormat === 'markdown') {
                const result = await convertToMarkdown(markdown, aiProvider, aiApiKey);
                setMarkdown(result);
            } else if (currentFormat === 'html') {
                const result = await fixHTML(htmlContent, aiProvider, aiApiKey);
                setHtmlContent(result);
            } else if (currentFormat === 'json') {
                const result = await fixJSON(jsonContent, aiProvider, aiApiKey);
                setJsonContent(result);
            }
        } catch (e) {
            toast.error(e.message, 'AI Error');
        } finally {
            setAiLoading(false);
        }
    }, [currentFormat, markdown, htmlContent, jsonContent, aiProvider, aiApiKey, toast]);

    // Toolbar config
    const toolbarConfig = currentFormat === 'html'
        ? { accept: '.html,.htm', label: 'Fix HTML' }
        : currentFormat === 'json'
            ? { accept: '.json', label: 'Fix JSON' }
            : { accept: '.md,.txt', label: 'Convert' };

    const handleScrollSyncToggle = useCallback(() => {
        setScrollSync(prev => !prev);
    }, []);

    const handleAIModeToggle = useCallback(() => {
        setAiMode(prev => {
            const next = !prev;
            saveAIMode(next);
            return next;
        });
    }, []);

    const handleOpenAISettings = useCallback(() => {
        setShowAISettings(true);
    }, []);

    const value = {
        // Theme & Config
        theme,
        handleThemeToggle,
        fontSize,
        handleFontSizeChange,
        scrollSync,
        setScrollSync,
        handleScrollSyncToggle,
        editorTheme,
        handleEditorThemeChange,
        handleAIModeToggle,
        handleOpenAISettings,

        // Content
        markdown,
        setMarkdown,
        htmlContent,
        setHtmlContent,
        jsonContent,
        setJsonContent,
        currentFormat,

        // Action Handlers
        handleUpload,
        handleExportHTML,
        handleExportPDF,
        handleCopy,
        handleClear,
        handleConfirmClear,

        // AI
        aiMode,
        setAiMode,
        aiProvider,
        setAiProvider,
        aiApiKey,
        setAiApiKey,
        showAISettings,
        setShowAISettings,
        aiLoading,
        handleAiAction,

        // Dialog & Toast
        showConfirmClear,
        setShowConfirmClear,
        toasts,
        removeToast,
        toolbarConfig,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
}

export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
}
