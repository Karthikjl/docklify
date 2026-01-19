import { useState, useEffect, useCallback } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import { loadMarkdown, saveMarkdown, loadTheme, saveTheme, loadFontSize, saveFontSize } from './utils/storageUtils';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);

  // Load saved data on mount
  useEffect(() => {
    const savedMarkdown = loadMarkdown();
    const savedTheme = loadTheme();
    const savedFontSize = loadFontSize();

    setMarkdown(savedMarkdown);
    setTheme(savedTheme);
    setFontSize(savedFontSize);

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
            />
          </div>
        </div>
      </div>

      <StatusBar markdown={markdown} />
    </div>
  );
}

export default App;
