import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ value, onChange, theme, fontSize, scrollSync, language = 'markdown' }) {
    const editorRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false); // prevent feedback loops

    // Keep scrollSyncRef current whenever prop changes
    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;

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
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
