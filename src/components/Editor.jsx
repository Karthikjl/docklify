import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { EDITOR_THEMES } from '../utils/editorThemes';

export default function Editor({ value, onChange, theme, fontSize, scrollSync, language = 'markdown', editorTheme = 'vs-dark' }) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false);

    // Keep scrollSyncRef current whenever prop changes
    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Register all custom themes once on mount
        EDITOR_THEMES.forEach(({ id, data }) => {
            if (data) {
                try { monaco.editor.defineTheme(id, data); } catch (_) { }
            }
        });

        // Apply the initial theme
        monaco.editor.setTheme(editorTheme);

        // Configure editor options
        editor.updateOptions({
            fontSize: fontSize,
            fontFamily: 'Fira Code, monospace',
            lineNumbers: 'on',
            minimap: { enabled: true },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
        });

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            console.log('Auto-save enabled');
        });

        // Dispatch scroll events to preview when user scrolls editor
        editor.onDidScrollChange((e) => {
            if (!scrollSyncRef.current) return;
            if (isSyncingRef.current) return; // ignore programmatic scrolls

            const scrollTop = e.scrollTop;
            const scrollHeight = editor.getScrollHeight();
            const clientHeight = editor.getLayoutInfo().height;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll <= 0) return;

            const scrollPercentage = scrollTop / maxScroll;

            window.dispatchEvent(new CustomEvent('editor-scroll', {
                detail: { scrollPercentage }
            }));
        });
    }

    // Update font size when it changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ fontSize });
        }
    }, [fontSize]);

    // Apply editor theme when it changes
    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(editorTheme);
        }
    }, [editorTheme]);

    // Listen for preview-scroll events and mirror to editor
    // NOTE: We always attach the listener; the ref guards enable/disable sync
    useEffect(() => {
        const handlePreviewScroll = (event) => {
            if (!scrollSyncRef.current) return;
            if (!editorRef.current) return;

            const { scrollPercentage } = event.detail;
            const scrollHeight = editorRef.current.getScrollHeight();
            const clientHeight = editorRef.current.getLayoutInfo().height;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll <= 0) return;

            const targetScrollTop = maxScroll * scrollPercentage;
            const currentScrollTop = editorRef.current.getScrollTop();

            if (Math.abs(targetScrollTop - currentScrollTop) > 2) {
                isSyncingRef.current = true;
                editorRef.current.setScrollTop(targetScrollTop);
                // Reset flag after a short delay (Monaco scroll is async)
                setTimeout(() => { isSyncingRef.current = false; }, 50);
            }
        };

        window.addEventListener('preview-scroll', handlePreviewScroll);
        return () => window.removeEventListener('preview-scroll', handlePreviewScroll);
    }, []); // mount/unmount only — refs handle the live state

    return (
        <div className="h-full w-full">
            <MonacoEditor
                height="100%"
                language={language}
                value={value}
                onChange={(val) => onChange(!val?.trim() ? '' : val)}
                theme={editorTheme}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: fontSize,
                    fontFamily: 'Fira Code, monospace',
                    lineNumbers: 'on',
                    minimap: { enabled: true },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
                loading={
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-dark-500">Loading editor...</div>
                    </div>
                }
            />
        </div>
    );
}
