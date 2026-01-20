import { useState, useEffect, useCallback } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import AISettings from './components/AISettings';
import { loadMarkdown, saveMarkdown, loadTheme, saveTheme, loadFontSize, saveFontSize } from './utils/storageUtils';
import { loadAIMode, saveAIMode, loadProvider, loadApiKey, hasApiKey } from './utils/aiStorage';
import { convertToMarkdown } from './utils/aiService';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [scrollSync, setScrollSync] = useState(true); // Enable scroll sync by default

  // AI Mode states
  const [aiMode, setAiMode] = useState(false);
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiApiKey, setAiApiKey] = useState('');
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedMarkdown = loadMarkdown();
    const savedTheme = loadTheme();
    const savedFontSize = loadFontSize();
    const savedAIMode = loadAIMode();
    const savedProvider = loadProvider();
    const savedApiKey = loadApiKey();

    setMarkdown(savedMarkdown);
    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setAiMode(savedAIMode);
    setAiProvider(savedProvider);
    setAiApiKey(savedApiKey);

    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-save markdown with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveMarkdown(markdown);
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown]);

  // Handle theme toggle
  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle font size change
  const handleFontSizeChange = useCallback((newSize) => {
    setFontSize(newSize);
    saveFontSize(newSize);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear all content?')) {
      setMarkdown('');
    }
  }, []);

  // Handle scroll sync toggle
  const handleScrollSyncToggle = useCallback(() => {
    setScrollSync(prev => !prev);
  }, []);

  // Handle AI mode toggle
  const handleAIModeToggle = useCallback(() => {
    const newMode = !aiMode;
    setAiMode(newMode);
    saveAIMode(newMode);

    // If enabling AI mode and no API key, show settings
    if (newMode && !hasApiKey()) {
      setShowAISettings(true);
    }
  }, [aiMode]);

  // Handle AI settings save
  const handleAISettingsSave = useCallback((provider, apiKey) => {
    setAiProvider(provider);
    setAiApiKey(apiKey);
  }, []);

  // Handle convert to Markdown
  const handleConvertToMarkdown = useCallback(async () => {
    console.log('🤖 AI Conversion started');
    console.log('API Key exists:', !!aiApiKey);
    console.log('Provider:', aiProvider);
    console.log('Input text length:', markdown?.length);

    if (!aiApiKey) {
      console.log('⚠️ No API key, opening settings');
      setShowAISettings(true);
      return;
    }

    if (!markdown || markdown.trim().length === 0) {
      console.log('⚠️ No text to convert');
      alert('Please enter some text to convert');
      return;
    }

    setAiLoading(true);
    console.log('⏳ Loading started');

    try {
      console.log('📤 Sending to AI...');
      const convertedMarkdown = await convertToMarkdown(markdown, aiProvider, aiApiKey);
      console.log('✅ AI Response received, length:', convertedMarkdown?.length);
      console.log('📝 Converted text preview:', convertedMarkdown?.substring(0, 100));

      setMarkdown(convertedMarkdown);
      console.log('✅ Markdown state updated');
    } catch (error) {
      console.error('❌ Conversion error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setAiLoading(false);
      console.log('⏹️ Loading stopped');
    }
  }, [markdown, aiProvider, aiApiKey]);

  return (
    <div className="flex flex-col h-screen bg-dark-50 dark:bg-dark-900">
      <Toolbar
        markdown={markdown}
        onMarkdownChange={setMarkdown}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onClear={handleClear}
        scrollSync={scrollSync}
        onScrollSyncToggle={handleScrollSyncToggle}
        aiMode={aiMode}
        onAIModeToggle={handleAIModeToggle}
        onAISettings={() => setShowAISettings(true)}
        onConvertToMarkdown={handleConvertToMarkdown}
        aiLoading={aiLoading}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 border-r border-dark-200 dark:border-dark-700 flex flex-col">
          <div className="glass px-4 py-2 text-sm font-medium text-dark-700 dark:text-dark-300 border-b border-dark-200 dark:border-dark-700">
            📝 Editor
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              value={markdown}
              onChange={setMarkdown}
              theme={theme}
              fontSize={fontSize}
              scrollSync={scrollSync}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="glass px-4 py-2 text-sm font-medium text-dark-700 dark:text-dark-300 border-b border-dark-200 dark:border-dark-700">
            👁️ Preview
          </div>
          <div className="flex-1 overflow-hidden">
            <Preview
              markdown={markdown}
              theme={theme}
              fontSize={fontSize}
              scrollSync={scrollSync}
            />
          </div>
        </div>
      </div>

      <StatusBar markdown={markdown} />

      {/* AI Settings Modal */}
      <AISettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onSave={handleAISettingsSave}
      />
    </div>
  );
}

export default App;
