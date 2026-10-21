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
    loadHTMLTabs,
    saveHTMLTabs,
    loadJSONContent,
    saveJSONContent
} from '../utils/storageUtils';
import { loadAIMode, saveAIMode, loadModel, loadApiKey } from '../utils/aiStorage';
import { DEFAULT_EDITOR_THEME } from '../utils/editorThemes';
import { convertToMarkdown, fixHTML, fixJSON } from '../utils/aiService';
import { exportAsHTML, exportAsPDF, exportHTMLAsPDF, copyHTMLToClipboard } from '../utils/exportUtils';
import { renderMarkdown } from '../renderers/markdownRenderer';
import { renderJSON } from '../renderers/jsonRenderer';
import { splitHTML, buildFullHTML } from '../renderers/htmlRenderer';
import { DEFAULT_MARKDOWN, DEFAULT_HTML, DEFAULT_JSON, DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE } from '../utils/defaultContent';

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
    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');
    const [activeHtmlTab, setActiveHtmlTab] = useState('html');
    const [jsonContent, setJsonContent] = useState('');

    // AI State
    const [aiMode, setAiMode] = useState(false);
    const [aiModel, setAiModel] = useState('');
    const [aiApiKey, setAiApiKey] = useState('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    // Determine current format based on pathname
    const currentFormat = pathname === '/html' ? 'html' : pathname === '/json' ? 'json' : 'markdown';

    // Initial load from storage on client mount
    useEffect(() => {
        const savedMarkdown = loadMarkdown();
        const savedTabs = loadHTMLTabs();
        const savedHTML = loadHTMLContent();
        const savedJSON = loadJSONContent();

        setMarkdown(savedMarkdown || DEFAULT_MARKDOWN);

        let initialHtml = '';
        let initialCss = '';
        let initialJs = '';

        const isLegacyTabs = savedTabs && savedTabs.html && (savedTabs.html.includes('sample-form') || savedTabs.html.includes('Web Playground'));
        const isLegacyJSON = savedJSON && (savedJSON.includes('"version":"1.0.0"') || savedJSON.includes('"capabilities":["Format","Minify"]'));

        if (isLegacyTabs || !savedTabs) {
            initialHtml = DEFAULT_HTML_CODE;
            initialCss = DEFAULT_CSS_CODE;
            initialJs = DEFAULT_JS_CODE;
        } else if (savedTabs && (savedTabs.html !== undefined || savedTabs.css !== undefined || savedTabs.js !== undefined)) {
            initialHtml = savedTabs.html || '';
            initialCss = savedTabs.css || '';
            initialJs = savedTabs.js || '';
        } else if (savedHTML) {
            const split = splitHTML(savedHTML);
            initialHtml = split.html;
            initialCss = split.css;
            initialJs = split.js;
        } else {
            initialHtml = DEFAULT_HTML_CODE;
            initialCss = DEFAULT_CSS_CODE;
            initialJs = DEFAULT_JS_CODE;
        }

        setHtmlCode(initialHtml);
        setCssCode(initialCss);
        setJsCode(initialJs);

        const combinedHTML = (isLegacyTabs || !savedHTML) ? buildFullHTML(initialHtml, initialCss, initialJs) : savedHTML;
        setHtmlContent(combinedHTML);
        setJsonContent((isLegacyJSON || !savedJSON) ? DEFAULT_JSON : savedJSON);

        const savedTheme = loadTheme();
        setTheme(savedTheme);
        setFontSize(loadFontSize());
        setAiMode(loadAIMode());
        setAiModel(loadModel());
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

    // Sync HTML tabs -> combined htmlContent & auto-save
    useEffect(() => {
        if (htmlCode === '' && cssCode === '' && jsCode === '') return;
        const combined = buildFullHTML(htmlCode, cssCode, jsCode);
        setHtmlContent(combined);
        const timer = setTimeout(() => {
            saveHTMLTabs({ html: htmlCode, css: cssCode, js: jsCode });
            saveHTMLContent(combined);
        }, 500);
        return () => clearTimeout(timer);
    }, [htmlCode, cssCode, jsCode]);

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

    // Upload content with format & extension-aware routing
    const handleUpload = useCallback((filesOrContent) => {
        const files = Array.isArray(filesOrContent)
            ? filesOrContent
            : typeof filesOrContent === 'object' && filesOrContent !== null && 'content' in filesOrContent
                ? [filesOrContent]
                : [{ name: 'upload', extension: '', content: String(filesOrContent || '') }];

        if (!files.length) return;

        if (currentFormat === 'html') {
            let nextHtml = htmlCode;
            let nextCss = cssCode;
            let nextJs = jsCode;
            const updatedTabs = [];
            let lastTab = null;

            for (const file of files) {
                const ext = file.extension?.toLowerCase() || '';
                const content = file.content || '';

                if (ext === '.css') {
                    nextCss = content;
                    updatedTabs.push(`CSS (${file.name})`);
                    lastTab = 'css';
                } else if (ext === '.js' || ext === '.mjs') {
                    nextJs = content;
                    updatedTabs.push(`Script (${file.name})`);
                    lastTab = 'js';
                } else if (ext === '.html' || ext === '.htm' || content.trim().startsWith('<') || content.includes('</html>')) {
                    const split = splitHTML(content);
                    nextHtml = split.html;
                    if (split.css) {
                        nextCss = split.css;
                    }
                    if (split.js) {
                        nextJs = split.js;
                    }
                    updatedTabs.push(`HTML (${file.name})`);
                    lastTab = 'html';
                } else {
                    if (activeHtmlTab === 'css') {
                        nextCss = content;
                        updatedTabs.push(`CSS (${file.name})`);
                        lastTab = 'css';
                    } else if (activeHtmlTab === 'js') {
                        nextJs = content;
                        updatedTabs.push(`Script (${file.name})`);
                        lastTab = 'js';
                    } else {
                        nextHtml = content;
                        updatedTabs.push(`HTML (${file.name})`);
                        lastTab = 'html';
                    }
                }
            }

            setHtmlCode(nextHtml);
            setCssCode(nextCss);
            setJsCode(nextJs);
            const combined = buildFullHTML(nextHtml, nextCss, nextJs);
            setHtmlContent(combined);
            saveHTMLTabs({ html: nextHtml, css: nextCss, js: nextJs });
            saveHTMLContent(combined);

            if (lastTab) {
                setActiveHtmlTab(lastTab);
            }

            if (updatedTabs.length === 1) {
                toast.success(`Imported ${updatedTabs[0]}`, 'File Uploaded');
            } else if (updatedTabs.length > 1) {
                toast.success(`Imported ${updatedTabs.length} files: ${updatedTabs.join(', ')}`, 'Bundle Uploaded');
            }
        } else if (currentFormat === 'json') {
            const file = files[0];
            const content = file?.content || '';

            try {
                const parsed = JSON.parse(content);
                const formatted = JSON.stringify(parsed, null, 2);
                setJsonContent(formatted);
                saveJSONContent(formatted);
                toast.success(`Imported and formatted JSON: ${file.name || 'document.json'}`, 'JSON Uploaded');
            } catch (err) {
                setJsonContent(content);
                saveJSONContent(content);
                toast.warning(`Uploaded with JSON syntax error: ${err.message}`, 'JSON Warning');
            }
        } else {
            const file = files[0];
            const content = file?.content || '';
            setMarkdown(content);
            saveMarkdown(content);
            toast.success(`Imported Markdown: ${file.name || 'document.md'}`, 'Markdown Uploaded');
        }
    }, [currentFormat, htmlCode, cssCode, jsCode, activeHtmlTab, toast]);

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
        else if (currentFormat === 'json') {
            try {
                contentToCopy = JSON.stringify(JSON.parse(jsonContent), null, 2);
            } catch {
                contentToCopy = jsonContent;
            }
        }
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
        if (currentFormat === 'html') {
            setHtmlCode('');
            setCssCode('');
            setJsCode('');
            setHtmlContent('');
            saveHTMLTabs({ html: '', css: '', js: '' });
            saveHTMLContent('');
        } else if (currentFormat === 'json') {
            setJsonContent('');
        } else {
            setMarkdown('');
        }
        setShowConfirmClear(false);
        toast.success('Editor cleared.', 'Cleared');
    }, [currentFormat, toast]);

    // Reset to default template
    const handleReset = useCallback(() => {
        const isEmpty = currentFormat === 'html'
            ? (!htmlCode?.trim() && !cssCode?.trim() && !jsCode?.trim())
            : currentFormat === 'json'
                ? !jsonContent?.trim()
                : !markdown?.trim();

        if (isEmpty) {
            if (currentFormat === 'html') {
                setHtmlCode(DEFAULT_HTML_CODE);
                setCssCode(DEFAULT_CSS_CODE);
                setJsCode(DEFAULT_JS_CODE);
                const combined = buildFullHTML(DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE);
                setHtmlContent(combined);
                saveHTMLTabs({ html: DEFAULT_HTML_CODE, css: DEFAULT_CSS_CODE, js: DEFAULT_JS_CODE });
                saveHTMLContent(combined);
                toast.success('Default HTML template loaded.', 'Template Restored');
            } else if (currentFormat === 'json') {
                setJsonContent(DEFAULT_JSON);
                saveJSONContent(DEFAULT_JSON);
                toast.success('Default JSON template loaded.', 'Template Restored');
            } else {
                setMarkdown(DEFAULT_MARKDOWN);
                saveMarkdown(DEFAULT_MARKDOWN);
                toast.success('Default Markdown template loaded.', 'Template Restored');
            }
        } else {
            setShowConfirmReset(true);
        }
    }, [currentFormat, htmlCode, cssCode, jsCode, jsonContent, markdown, toast]);

    const handleConfirmReset = useCallback(() => {
        if (currentFormat === 'html') {
            setHtmlCode(DEFAULT_HTML_CODE);
            setCssCode(DEFAULT_CSS_CODE);
            setJsCode(DEFAULT_JS_CODE);
            const combined = buildFullHTML(DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE);
            setHtmlContent(combined);
            saveHTMLTabs({ html: DEFAULT_HTML_CODE, css: DEFAULT_CSS_CODE, js: DEFAULT_JS_CODE });
            saveHTMLContent(combined);
            toast.success('Default HTML template restored.', 'Template Restored');
        } else if (currentFormat === 'json') {
            setJsonContent(DEFAULT_JSON);
            saveJSONContent(DEFAULT_JSON);
            toast.success('Default JSON template restored.', 'Template Restored');
        } else {
            setMarkdown(DEFAULT_MARKDOWN);
            saveMarkdown(DEFAULT_MARKDOWN);
            toast.success('Default Markdown template restored.', 'Template Restored');
        }
        setShowConfirmReset(false);
    }, [currentFormat, toast]);

    // AI Action
    const handleAiAction = useCallback(async () => {
        if (!aiApiKey || !aiModel) {
            setShowAISettings(true);
            return;
        }

        if (currentFormat === 'markdown' && !markdown.trim()) {
            toast.warning('Enter some text first.', 'Nothing to convert');
            return;
        }
        if (currentFormat === 'html' && !htmlCode.trim() && !cssCode.trim() && !jsCode.trim()) {
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
                const result = await convertToMarkdown(markdown, aiApiKey, aiModel);
                setMarkdown(result);
            } else if (currentFormat === 'html') {
                const fixed = await fixHTML(
                    { html: htmlCode, css: cssCode, js: jsCode },
                    aiApiKey,
                    aiModel
                );
                setHtmlCode(fixed.html);
                setCssCode(fixed.css);
                setJsCode(fixed.js);
                setHtmlContent(buildFullHTML(fixed.html, fixed.css, fixed.js));
            } else if (currentFormat === 'json') {
                const result = await fixJSON(jsonContent, aiApiKey, aiModel);
                setJsonContent(result);
            }
        } catch (e) {
            toast.error(e.message, 'AI Error');
        } finally {
            setAiLoading(false);
        }
    }, [currentFormat, markdown, htmlCode, cssCode, jsCode, jsonContent, aiApiKey, aiModel, toast]);

    // Toolbar config
    const toolbarConfig = currentFormat === 'html'
        ? {
            accept: '.html,.htm,.css,.js',
            label: 'Fix HTML',
            tooltip: 'Upload Web files (.html, .css, .js)',
            multiple: true,
        }
        : currentFormat === 'json'
            ? {
                accept: '.json',
                label: 'Fix JSON',
                tooltip: 'Upload JSON (.json)',
                multiple: false,
            }
            : {
                accept: '.md,.markdown,.txt',
                label: 'Convert',
                tooltip: 'Upload Markdown (.md, .txt)',
                multiple: false,
            };

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
        htmlCode,
        setHtmlCode,
        cssCode,
        setCssCode,
        jsCode,
        setJsCode,
        activeHtmlTab,
        setActiveHtmlTab,
        jsonContent,
        setJsonContent,
        currentFormat,

        // Action Handlers
        handleUpload,
        handleExportHTML,
        handleExportPDF,
        handleCopy,
        handleReset,
        handleConfirmReset,
        handleClear,
        handleConfirmClear,

        // AI
        aiMode,
        setAiMode,
        aiModel,
        setAiModel,
        aiApiKey,
        setAiApiKey,
        showAISettings,
        setShowAISettings,
        aiLoading,
        handleAiAction,

        // Dialog & Toast
        showConfirmClear,
        setShowConfirmClear,
        showConfirmReset,
        setShowConfirmReset,
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
