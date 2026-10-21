'use client';

import Header from './Header';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import AISettings from './AISettings';
import AIPromptDialog from './AIPromptDialog';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { ResetIcon } from './Icons';
import { GENERATE_CONFIG } from '../utils/generateConfig';
import { useEditor } from '../context/EditorContext';

export default function AppShell({ children }) {
    const editor = useEditor();

    const currentContent = editor.currentFormat === 'markdown'
        ? editor.markdown
        : editor.currentFormat === 'html'
            ? editor.htmlContent
            : editor.currentFormat === 'mermaid'
                ? editor.mermaidContent
                : editor.jsonContent;

    const generateConfig = GENERATE_CONFIG[editor.currentFormat];
    const hasContent = editor.currentFormat === 'html'
        ? Boolean(editor.htmlCode.trim() || editor.cssCode.trim() || editor.jsCode.trim())
        : editor.currentFormat === 'json'
            ? Boolean(editor.jsonContent.trim())
            : editor.currentFormat === 'mermaid'
                ? Boolean(editor.mermaidContent.trim())
                : Boolean(editor.markdown.trim());

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
                onReset={editor.handleReset}
                onClear={editor.handleClear}
                theme={editor.theme}
                onThemeToggle={editor.handleThemeToggle}
                fontSize={editor.fontSize}
                onFontSizeChange={editor.handleFontSizeChange}
                scrollSync={editor.scrollSync}
                onScrollSyncToggle={editor.handleScrollSyncToggle}
                showScrollSync={editor.currentFormat === 'markdown' || editor.currentFormat === 'json'}
                aiMode={editor.aiMode}
                onAIModeToggle={editor.handleAIModeToggle}
                onAISettings={editor.handleOpenAISettings}
                aiLoading={editor.aiLoading}
                onAiAction={editor.handleAiAction}
                uploadAccept={editor.toolbarConfig.accept}
                uploadTooltip={editor.toolbarConfig.tooltip}
                uploadMultiple={editor.toolbarConfig.multiple}
                aiActionLabel={editor.toolbarConfig.label}
            />

            <main className="flex-1 overflow-hidden relative" style={{ isolation: 'isolate' }}>
                {children}
            </main>

            <StatusBar markdown={currentContent} />

            <AISettings
                key={editor.showAISettings ? 'open' : 'closed'}
                isOpen={editor.showAISettings}
                onClose={editor.handleAISettingsClose}
                onSave={editor.handleAISettingsSaved}
            />

            {generateConfig && (
                <AIPromptDialog
                    key={`${editor.showGenerate ? 'open' : 'closed'}-${editor.currentFormat}`}
                    isOpen={editor.showGenerate}
                    onClose={() => editor.setShowGenerate(false)}
                    title={generateConfig.title}
                    description={generateConfig.description}
                    placeholder={generateConfig.placeholder}
                    submitLabel="Generate"
                    modes={hasContent
                        ? [
                            { value: 'new', label: 'Start new' },
                            { value: 'edit', label: 'Edit current' },
                        ]
                        : undefined}
                    onSubmit={editor.handleGenerate}
                />
            )}

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

            <ConfirmDialog
                isOpen={editor.showConfirmReset}
                icon={<ResetIcon size={16} />}
                title="Reset to default template?"
                message={`This will replace your current ${
                    editor.currentFormat === 'html'
                        ? 'HTML, CSS, and Script'
                        : editor.currentFormat.toUpperCase()
                } content with the default starter template.`}
                confirmLabel="Reset Template"
                cancelLabel="Keep Current"
                onConfirm={editor.handleConfirmReset}
                onCancel={() => editor.setShowConfirmReset(false)}
            />
        </div>
    );
}
