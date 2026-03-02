import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import AISettings from './components/AISettings';
// Pages
import MarkdownPage from './pages/MarkdownPage';
import HtmlPage from './pages/HtmlPage';
import JsonPage from './pages/JsonPage';
// Utils
import { loadMarkdown, saveMarkdown, loadTheme, saveTheme, loadFontSize, saveFontSize, loadHTMLContent, saveHTMLContent, loadJSONContent, saveJSONContent } from './utils/storageUtils';
import { loadAIMode, saveAIMode, loadProvider, loadApiKey } from './utils/aiStorage';
import { convertToMarkdown, fixHTML, fixJSON } from './utils/aiService';
import { exportAsHTML, exportAsPDF, copyHTMLToClipboard } from './utils/exportUtils';
import { renderMarkdown } from './renderers/markdownRenderer';
import { renderHTML } from './renderers/htmlRenderer';
import { renderJSON } from './renderers/jsonRenderer';
import { DEFAULT_MARKDOWN, DEFAULT_HTML, DEFAULT_JSON } from './utils/defaultContent';

// Shared context provider
function AppContent() {
  const location = useLocation();

  // Shared State
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [scrollSync, setScrollSync] = useState(true);

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

  // Initial Load
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

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-save markdown
  useEffect(() => {
    const timer = setTimeout(() => saveMarkdown(markdown), 500);
    return () => clearTimeout(timer);
  }, [markdown]);

  // Auto-save HTML
  useEffect(() => {
    const timer = setTimeout(() => saveHTMLContent(htmlContent), 500);
    return () => clearTimeout(timer);
  }, [htmlContent]);

  // Auto-save JSON
  useEffect(() => {
    const timer = setTimeout(() => saveJSONContent(jsonContent), 500);
    return () => clearTimeout(timer);
  }, [jsonContent]);

  // Theme Toggle
  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size);
    saveFontSize(size);
  }, []);

  // Determine active format based on path
  const getFormat = () => {
    if (location.pathname === '/html') return 'html';
    if (location.pathname === '/json') return 'json';
    return 'markdown';
  };
  const currentFormat = getFormat();

  // Dynamic Handlers
  const handleUpload = useCallback((content) => {
    if (currentFormat === 'html') setHtmlContent(content);
    else if (currentFormat === 'json') setJsonContent(content);
    else {
      setMarkdown(content);
      saveMarkdown(content);
    }
  }, [currentFormat]);

  const handleExportHTML = useCallback(() => {
    let contentToExport = '';
    let filename = 'document.html';

    if (currentFormat === 'html') {
      contentToExport = htmlContent;
    } else if (currentFormat === 'json') {
      contentToExport = renderJSON(jsonContent);
    } else {
      contentToExport = renderMarkdown(markdown);
    }
    exportAsHTML(contentToExport, filename);
  }, [currentFormat, htmlContent, jsonContent, markdown]);

  const handleExportPDF = useCallback(async () => {
    const previewElement = document.querySelector('.markdown-preview');
    if (!previewElement) {
      alert('Preview not found');
      return;
    }
    try {
      await exportAsPDF(previewElement, 'document.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Error exporting PDF');
    }
  }, []);

  const handleCopy = useCallback(async () => {
    let contentToCopy = '';
    if (currentFormat === 'html') contentToCopy = htmlContent;
    else if (currentFormat === 'json') contentToCopy = renderJSON(jsonContent);
    else contentToCopy = renderMarkdown(markdown);

    try {
      await copyHTMLToClipboard(contentToCopy);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
    }
  }, [currentFormat, htmlContent, jsonContent, markdown]);

  const handleClear = useCallback(() => {
    if (confirm('Clear current editor content?')) {
      if (currentFormat === 'html') setHtmlContent('');
      else if (currentFormat === 'json') setJsonContent('');
      else setMarkdown('');
    }
  }, [currentFormat]);

  // AI Handler (for all formats)
  const handleAiAction = useCallback(async () => {
    if (!aiApiKey) { setShowAISettings(true); return; }

    // Check if there's content to process
    if (currentFormat === 'markdown' && !markdown.trim()) {
      return alert('Enter text first');
    }
    if (currentFormat === 'html' && !htmlContent.trim()) {
      return alert('Enter HTML first');
    }
    if (currentFormat === 'json' && !jsonContent.trim()) {
      return alert('Enter JSON first');
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
      alert(e.message);
    } finally {
      setAiLoading(false);
    }
  }, [currentFormat, markdown, htmlContent, jsonContent, aiProvider, aiApiKey]);

  // Configuration for Toolbar
  const getToolbarConfig = () => {
    switch (currentFormat) {
      case 'html': return { accept: '.html,.htm', label: 'Fix HTML' };
      case 'json': return { accept: '.json', label: 'Fix JSON' };
      default: return { accept: '.md,.txt', label: 'Convert' };
    }
  };
  const toolbarConfig = getToolbarConfig();

  // Shared props for pages
  const sharedProps = {
    markdown, setMarkdown,
    htmlContent, setHtmlContent,
    jsonContent, setJsonContent,
    theme, fontSize, scrollSync
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'light' ? 'light-theme' : ''} bg-transparent text-slate-900 dark:text-white transition-colors duration-300`}>
      <Header />

      <Toolbar
        onUpload={handleUpload}
        onExportHTML={handleExportHTML}
        onExportPDF={handleExportPDF}
        onCopy={handleCopy}
        onClear={handleClear}
        theme={theme} onThemeToggle={handleThemeToggle}
        fontSize={fontSize} onFontSizeChange={handleFontSizeChange}
        scrollSync={scrollSync} onScrollSyncToggle={() => setScrollSync(!scrollSync)}
        aiMode={aiMode} onAIModeToggle={() => { setAiMode(!aiMode); saveAIMode(!aiMode); }}
        onAISettings={() => setShowAISettings(true)}
        aiLoading={aiLoading} onAiAction={handleAiAction}
        uploadAccept={toolbarConfig.accept}
        aiActionLabel={toolbarConfig.label}
      />

      <div className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/" element={<MarkdownPage {...sharedProps} />} />
          <Route path="/html" element={<HtmlPage {...sharedProps} />} />
          <Route path="/json" element={<JsonPage {...sharedProps} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <StatusBar markdown={currentFormat === 'markdown' ? markdown : (currentFormat === 'html' ? htmlContent : jsonContent)} />

      <AISettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onSave={(p, k) => { setAiProvider(p); setAiApiKey(k); }}
      />
    </div>
  );
}

// Main App with Router
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
