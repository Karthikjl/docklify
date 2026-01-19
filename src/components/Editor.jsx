import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function MarkdownEditor({ value, onChange, theme, fontSize }) {
    const editorRef = useRef(null);

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
    }

    // Update font size when it changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ fontSize });
        }
    }, [fontSize]);

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
