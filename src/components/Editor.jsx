import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function MarkdownEditor({ value, onChange, theme, fontSize, scrollSync }) {
    const editorRef = useRef(null);
    const isScrolling = useRef(false);

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
            // Save is automatic, just show a message
            console.log('Auto-save enabled');
        });

        // Handle scroll sync
        editor.onDidScrollChange((e) => {
            if (!scrollSync || isScrolling.current) {
                isScrolling.current = false;
                return;
            }

            const scrollTop = e.scrollTop;
            const scrollHeight = editor.getScrollHeight();
            const clientHeight = editor.getLayoutInfo().height;
            const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

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

    // Handle scroll sync from preview
    useEffect(() => {
        if (!scrollSync || !editorRef.current) return;

        const handlePreviewScroll = (event) => {
            if (isScrolling.current) {
                isScrolling.current = false;
                return;
            }

            const { scrollPercentage } = event.detail;
            if (editorRef.current) {
                const scrollHeight = editorRef.current.getScrollHeight();
                const clientHeight = editorRef.current.getLayoutInfo().height;
                const maxScroll = scrollHeight - clientHeight;
                isScrolling.current = true;
                editorRef.current.setScrollTop(maxScroll * scrollPercentage);
            }
        };

        window.addEventListener('preview-scroll', handlePreviewScroll);
        return () => window.removeEventListener('preview-scroll', handlePreviewScroll);
    }, [scrollSync]);

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                defaultLanguage="markdown"
                value={value}
                onChange={onChange}
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
