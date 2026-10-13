'use client';

import Header from './Header';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import AISettings from './AISettings';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { useEditor } from '../context/EditorContext';

export default function AppShell({ children }) {
    const editor = useEditor();

    const currentContent = editor.currentFormat === 'markdown'
        ? editor.markdown
        : editor.currentFormat === 'html'
            ? editor.htmlContent
            : editor.jsonContent;

    return (
        <div className={`flex flex-col h-screen ${editor.theme === 'light' ? 'light-theme bg-white text-zinc-900' : 'bg-[#09090b] text-zinc-100'}`}>
            <Header
                editorTheme={editor.editorTheme}
                onEditorThemeChange={editor.handleEditorThemeChange}
                theme={editor.theme}
            />

            <Toolbar
                onUpload={editor.handleUpload}
                onExportHTML={editor.handleExportHTML}
                onExportPDF={editor.handleExportPDF}
                onCopy={editor.handleCopy}
                onClear={editor.handleClear}
                theme={editor.theme}
                onThemeToggle={editor.handleThemeToggle}
                fontSize={editor.fontSize}
                onFontSizeChange={editor.handleFontSizeChange}
                scrollSync={editor.scrollSync}
                onScrollSyncToggle={editor.handleScrollSyncToggle}
                showScrollSync={editor.currentFormat === 'markdown'}
                aiMode={editor.aiMode}
                onAIModeToggle={editor.handleAIModeToggle}
                onAISettings={editor.handleOpenAISettings}
                aiLoading={editor.aiLoading}
                onAiAction={editor.handleAiAction}
                uploadAccept={editor.toolbarConfig.accept}
                aiActionLabel={editor.toolbarConfig.label}
            />

            <main className="flex-1 overflow-hidden relative" style={{ isolation: 'isolate' }}>
                {children}
            </main>

            <StatusBar markdown={currentContent} />

            <AISettings
                key={editor.showAISettings ? 'open' : 'closed'}
                isOpen={editor.showAISettings}
                onClose={() => editor.setShowAISettings(false)}
                onSave={(p, k) => {
                    editor.setAiProvider(p);
                    editor.setAiApiKey(k);
                }}
            />

            <Toast toasts={editor.toasts} onRemove={editor.removeToast} />

            <ConfirmDialog
                isOpen={editor.showConfirmClear}
                title="Clear editor content?"
                message="This will erase everything in the editor. This action cannot be undone."
                confirmLabel="Yes, clear it"
                cancelLabel="Keep it"
                variant="danger"
                onConfirm={editor.handleConfirmClear}
                onCancel={() => editor.setShowConfirmClear(false)}
            />
        </div>
    );
}
