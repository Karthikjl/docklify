'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
    saveJSONContent,
    loadMermaidContent,
    saveMermaidContent
} from '../utils/storageUtils';
import { loadAIMode, saveAIMode, loadModel, loadApiKey } from '../utils/aiStorage';
import { DEFAULT_EDITOR_THEME } from '../utils/editorThemes';
import { convertToMarkdown, fixHTML, fixJSON, fixMermaid, generateMermaid, generateHTML, generateJSON, generateMarkdown } from '../utils/aiService';
import { undoHint } from '../utils/generateConfig';
import { renderMermaid, validateMermaid, extractMermaidCode, getDiagramBackground } from '../utils/mermaidRenderer';
import { exportAsHTML, exportAsPDF, exportHTMLAsPDF, copyHTMLToClipboard } from '../utils/exportUtils';
import { renderMarkdown } from '../renderers/markdownRenderer';
import { renderJSON } from '../renderers/jsonRenderer';
import { splitHTML, buildFullHTML } from '../renderers/htmlRenderer';
import { DEFAULT_MARKDOWN, DEFAULT_HTML, DEFAULT_JSON, DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE } from '../utils/defaultContent';
import { DEFAULT_MERMAID } from '../utils/mermaidExamples';

const EditorContext = createContext(null);

/** Standalone HTML snippet containing the rendered diagram (portable SVG, no web fonts) */
async function buildMermaidExportHTML(code, appTheme, mermaidTheme) {
    if (!code.trim()) throw new Error('There is no diagram to export.');
    const { svg } = await renderMermaid(code, { appTheme, mermaidTheme, forExport: true });
    const background = getDiagramBackground(appTheme, mermaidTheme);
    return `<style>svg{max-width:100%;height:auto}</style><div style="text-align:center;background:${background};padding:16px">${svg}</div>`;
}

function describeExportError(error) {
    return error?.message ? `Could not render the diagram: ${error.message}` : 'Could not export the diagram.';
}

export function EditorProvider({ children }) {
    const pathname = usePathname() || '/';
    const { toasts, removeToast, toast } = useToast();

    // Shared State
    const [theme, setTheme] = useState('light');
    const [ready, setReady] = useState(false);
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
    const [mermaidContent, setMermaidContent] = useState('');
    const [mermaidTheme, setMermaidTheme] = useState('app');

    // AI State
    const [aiMode, setAiMode] = useState(false);
    const [aiModel, setAiModel] = useState('');
    const [aiApiKey, setAiApiKey] = useState('');
    const [showAISettings, setShowAISettings] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);
    const [pendingGenerate, setPendingGenerate] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    // Determine current format based on pathname
    // Client-side navigation can add a trailing slash (/html/), so compare without it
    const routePath = pathname.replace(/\/+$/, '') || '/';
    const currentFormat = routePath === '/html'
        ? 'html'
        : routePath === '/json'
            ? 'json'
            : routePath === '/mermaid'
                ? 'mermaid'
                : 'markdown';

    // Initial load from storage on client mount
    useEffect(() => {
        const savedMarkdown = loadMarkdown();
        const savedTabs = loadHTMLTabs();
        const savedHTML = loadHTMLContent();
        const savedJSON = loadJSONContent();
        const savedMermaid = loadMermaidContent();

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
        setMermaidContent(savedMermaid ?? DEFAULT_MERMAID);

        const savedTheme = loadTheme();
        setTheme(savedTheme);
        setFontSize(loadFontSize());
        setAiMode(loadAIMode());
        setAiModel(loadModel());
        setAiApiKey(loadApiKey());

        const savedMermaidTheme = localStorage.getItem('doclify-mermaid-theme');
        if (savedMermaidTheme) {
            setMermaidTheme(savedMermaidTheme);
        }

        const savedEditorTheme = localStorage.getItem('doclify-editor-theme');
        if (savedEditorTheme) {
            setEditorTheme(savedEditorTheme);
        }

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setReady(true);
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

    // Auto-save Mermaid (an empty diagram is a valid saved state, so don't skip empty)
    const mermaidLoadedRef = useRef(false);
    useEffect(() => {
        if (!mermaidLoadedRef.current) {
            // Skip the initial '' before storage has been read
            if (mermaidContent === '') return;
            mermaidLoadedRef.current = true;
        }
        const timer = setTimeout(() => saveMermaidContent(mermaidContent), 500);
        return () => clearTimeout(timer);
    }, [mermaidContent]);

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
        } else if (currentFormat === 'mermaid') {
            const file = files[0];
            const code = extractMermaidCode(file?.content || '');
            setMermaidContent(code);
            saveMermaidContent(code);
            toast.success(`Imported diagram: ${file.name || 'diagram.mmd'}`, 'Mermaid Uploaded');
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
    const handleExportHTML = useCallback(async () => {
        let contentToExport = '';
        const filename = 'document.html';

        if (currentFormat === 'mermaid') {
            try {
                const html = await buildMermaidExportHTML(mermaidContent, theme, mermaidTheme);
                exportAsHTML(html, 'diagram.html');
            } catch (error) {
                toast.error(describeExportError(error), 'Export Error');
            }
            return;
        }

        if (currentFormat === 'html') {
            contentToExport = htmlContent;
        } else if (currentFormat === 'json') {
            contentToExport = renderJSON(jsonContent);
        } else {
            contentToExport = renderMarkdown(markdown);
        }
        exportAsHTML(contentToExport, filename);
    }, [currentFormat, htmlContent, jsonContent, markdown, mermaidContent, theme, mermaidTheme, toast]);

    // Export PDF
    const handleExportPDF = useCallback(async () => {
        try {
            if (currentFormat === 'html') {
                await exportHTMLAsPDF(htmlContent, 'document.pdf');
                toast.success('PDF exported successfully!', 'Export');
                return;
            } else if (currentFormat === 'mermaid') {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = await buildMermaidExportHTML(mermaidContent, theme, mermaidTheme);
                await exportAsPDF(wrapper, 'diagram.pdf');
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
    }, [currentFormat, htmlContent, jsonContent, mermaidContent, theme, mermaidTheme, toast]);

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        let contentToCopy = '';
        if (currentFormat === 'html') contentToCopy = htmlContent;
        else if (currentFormat === 'mermaid') contentToCopy = mermaidContent;
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
    }, [currentFormat, htmlContent, jsonContent, markdown, mermaidContent, toast]);

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
        } else if (currentFormat === 'mermaid') {
            setMermaidContent('');
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
                : currentFormat === 'mermaid'
                    ? !mermaidContent?.trim()
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
            } else if (currentFormat === 'mermaid') {
                setMermaidContent(DEFAULT_MERMAID);
                saveMermaidContent(DEFAULT_MERMAID);
                toast.success('Default diagram loaded.', 'Template Restored');
            } else {
                setMarkdown(DEFAULT_MARKDOWN);
                saveMarkdown(DEFAULT_MARKDOWN);
                toast.success('Default Markdown template loaded.', 'Template Restored');
            }
        } else {
            setShowConfirmReset(true);
        }
    }, [currentFormat, htmlCode, cssCode, jsCode, jsonContent, markdown, mermaidContent, toast]);

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
        } else if (currentFormat === 'mermaid') {
            setMermaidContent(DEFAULT_MERMAID);
            saveMermaidContent(DEFAULT_MERMAID);
            toast.success('Default diagram restored.', 'Template Restored');
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
        if (currentFormat === 'mermaid' && !mermaidContent.trim()) {
            toast.warning('Enter or generate a diagram first.', 'Nothing to fix');
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
            } else if (currentFormat === 'mermaid') {
                // The parser tells us whether anything is wrong (and where): don't spend an AI call otherwise
                const problem = await validateMermaid(mermaidContent);
                if (!problem) {
                    toast.info('This diagram has no syntax errors.', 'Nothing to fix');
                } else {
                    const result = await fixMermaid(mermaidContent, problem.message, aiApiKey, aiModel);
                    setMermaidContent(result);
                    const stillBroken = await validateMermaid(result);
                    if (stillBroken) {
                        toast.warning('The AI fix still has an error. Review it or run Fix again.', 'Partly fixed');
                    }
                }
            }
        } catch (e) {
            toast.error(e.message, 'AI Error');
        } finally {
            setAiLoading(false);
        }
    }, [currentFormat, markdown, htmlCode, cssCode, jsCode, jsonContent, mermaidContent, aiApiKey, aiModel, toast]);

    // Generate (or edit) content for the current tab from a description
    const handleGenerate = useCallback(async (description, mode) => {
        if (!aiApiKey || !aiModel) {
            throw new Error('Add your Gemini API key and choose a model first.');
        }
        const edit = mode === 'edit';

        if (currentFormat === 'mermaid') {
            const code = await generateMermaid(description, aiApiKey, aiModel, {
                current: edit ? mermaidContent : '',
                validate: validateMermaid,
            });
            setMermaidContent(code);
            toast.success(`Diagram ready.${undoHint()}`, 'AI');
        } else if (currentFormat === 'html') {
            const result = await generateHTML(description, aiApiKey, aiModel, {
                current: edit ? { html: htmlCode, css: cssCode, js: jsCode } : null,
            });
            setHtmlCode(result.html);
            setCssCode(result.css);
            setJsCode(result.js);
            setHtmlContent(buildFullHTML(result.html, result.css, result.js));
            toast.success(`Page ready in the HTML, CSS and Script tabs.${undoHint()}`, 'AI');
        } else if (currentFormat === 'json') {
            const result = await generateJSON(description, aiApiKey, aiModel, {
                current: edit ? jsonContent : '',
            });
            setJsonContent(result);
            toast.success(`JSON ready.${undoHint()}`, 'AI');
        } else {
            const result = await generateMarkdown(description, aiApiKey, aiModel, {
                current: edit ? markdown : '',
            });
            setMarkdown(result);
            toast.success(`Document ready.${undoHint()}`, 'AI');
        }
    }, [currentFormat, aiApiKey, aiModel, mermaidContent, htmlCode, cssCode, jsCode, jsonContent, markdown, toast]);

    // The Generate dialog needs a key and model: if they are missing, ask for them first and
    // continue to the dialog once they are saved
    const openGenerate = useCallback(() => {
        // The button is always visible; using it switches AI Mode on so the other AI controls appear too
        if (!aiMode) {
            setAiMode(true);
            saveAIMode(true);
        }
        if (!aiApiKey || !aiModel) {
            setPendingGenerate(true);
            setShowAISettings(true);
        } else {
            setShowGenerate(true);
        }
    }, [aiMode, aiApiKey, aiModel]);

    const handleAISettingsSaved = useCallback((key, model) => {
        setAiApiKey(key);
        setAiModel(model);
        if (pendingGenerate) {
            setPendingGenerate(false);
            setShowGenerate(true);
        }
    }, [pendingGenerate]);

    const handleAISettingsClose = useCallback(() => {
        setShowAISettings(false);
        setPendingGenerate(false);
    }, []);

    // Toolbar config
    const toolbarConfig = currentFormat === 'html'
        ? {
            accept: '.html,.htm,.css,.js',
            label: 'Fix HTML',
            tooltip: 'Upload Web files (.html, .css, .js)',
            multiple: true,
        }
        : currentFormat === 'mermaid'
            ? {
                accept: '.mmd,.mermaid,.md,.txt',
                label: 'Fix Mermaid',
                tooltip: 'Upload diagram (.mmd, .mermaid, .md)',
                multiple: false,
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

    const handleMermaidThemeChange = useCallback((t) => {
        setMermaidTheme(t);
        if (typeof window !== 'undefined') {
            localStorage.setItem('doclify-mermaid-theme', t);
        }
    }, []);

    const handleOpenAISettings = useCallback(() => {
        setShowAISettings(true);
    }, []);

    const value = {
        // Theme & Config
        theme,
        ready,
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
        mermaidContent,
        setMermaidContent,
        mermaidTheme,
        handleMermaidThemeChange,
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
        handleGenerate,
        openGenerate,
        showGenerate,
        setShowGenerate,
        handleAISettingsSaved,
        handleAISettingsClose,
        toast,

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
