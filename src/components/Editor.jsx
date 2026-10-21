'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { EDITOR_THEMES } from '../utils/editorThemes';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { registerMermaidLanguage } from '../utils/mermaidLanguage';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-dark-500">Loading editor…</div>
        </div>
    ),
});

import MobileEditor from './MobileEditor';

// ── Main Editor component ─────────────────────────────────────────
export default function Editor({
    value,
    onChange,
    fontSize,
    scrollSync,
    language = 'markdown',
    editorTheme = 'vs-dark',
    readOnly = false,
    isSecondary = false,
    path,
    markers,
}) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false);
    const markersRef = useRef(markers);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    // Show problems (e.g. diagram syntax errors) as squiggles on the given lines
    function applyMarkers() {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const model = editor?.getModel();
        if (!monaco || !model) return;

        const lineCount = model.getLineCount();
        monaco.editor.setModelMarkers(
            model,
            'docklify',
            (markersRef.current || []).map((m) => {
                const line = Math.min(Math.max(m.line, 1), lineCount);
                return {
                    severity: monaco.MarkerSeverity.Error,
                    message: m.message,
                    startLineNumber: line,
                    endLineNumber: line,
                    startColumn: 1,
                    endColumn: model.getLineMaxColumn(line),
                };
            })
        );
    }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        applyMarkers();

        EDITOR_THEMES.forEach(({ id, data }) => {
            if (data) {
                try {
                    monaco.editor.defineTheme(id, data);
                } catch {
                    // Theme might already be defined
                }
            }
        });
        monaco.editor.setTheme(editorTheme);

        editor.updateOptions({
            readOnly,
            domReadOnly: readOnly,
            fontSize,
            fontFamily: '"Fira Code", monospace',
            lineNumbers: 'on',
            minimap: { enabled: windowWidth >= 1200 && !readOnly },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: false,
            cursorBlinking: readOnly ? 'hidden' : 'blink',
            cursorSmoothCaretAnimation: 'off',
            renderValidationDecorations: readOnly ? 'off' : 'editable',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            maxTokenizationLineLength: 20000,
            find: {
                addExtraSpaceOnTop: false,
            },
        });

        if (!readOnly) {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                console.log('Auto-save enabled');
            });
        }

        const outgoingEvent = isSecondary ? 'preview-scroll' : 'editor-scroll';

        let scrollRaf = null;
        editor.onDidScrollChange((e) => {
            if (!scrollSyncRef.current || isSyncingRef.current) return;
            if (e.scrollTopChanged === false) return;
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = null;
                if (!editorRef.current) return;
                const scrollTop = e.scrollTop;
                const scrollHeight = editorRef.current.getScrollHeight();
                const clientHeight = editorRef.current.getLayoutInfo().height;
                const maxScroll = scrollHeight - clientHeight;
                if (maxScroll <= 0) return;
                window.dispatchEvent(new CustomEvent(outgoingEvent, {
                    detail: { scrollPercentage: scrollTop / maxScroll }
                }));
            });
        });
    }

    useEffect(() => {
        markersRef.current = markers;
        applyMarkers();
    }, [markers]);

    useEffect(() => {
        if (editorRef.current) editorRef.current.updateOptions({ fontSize });
    }, [fontSize]);

    useEffect(() => {
        if (monacoRef.current) monacoRef.current.editor.setTheme(editorTheme);
    }, [editorTheme]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({
                readOnly,
                domReadOnly: readOnly,
                cursorBlinking: readOnly ? 'hidden' : 'blink',
            });
        }
    }, [readOnly]);

    useEffect(() => {
        const incomingEvent = isSecondary ? 'editor-scroll' : 'preview-scroll';
        const handleSyncScroll = (event) => {
            if (!scrollSyncRef.current || !editorRef.current) return;
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
                setTimeout(() => { isSyncingRef.current = false; }, 50);
            }
        };
        window.addEventListener(incomingEvent, handleSyncScroll);
        return () => window.removeEventListener(incomingEvent, handleSyncScroll);
    }, [isSecondary]);

    // ── Mobile / Android: native textarea (Monaco is broken on Android) ──
    if (isMobile) {
        return (
            <MobileEditor
                value={value}
                onChange={onChange}
                editorTheme={editorTheme}
                fontSize={fontSize}
                language={language}
                readOnly={readOnly}
            />
        );
    }

    const isDark = editorTheme !== 'vs';

    // ── Desktop: full Monaco editor ──────────────────────────────
    return (
        <div className={`h-full w-full ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <MonacoEditor
                height="100%"
                path={path}
                language={language}
                value={value}
                onChange={(val) => {
                    if (!readOnly && onChange) {
                        onChange(!val?.trim() ? '' : val);
                    }
                }}
                theme={editorTheme}
                beforeMount={registerMermaidLanguage}
                onMount={handleEditorDidMount}
                options={{
                    readOnly,
                    domReadOnly: readOnly,
                    fontSize,
                    fontFamily: '"Fira Code", monospace',
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    find: {
                        addExtraSpaceOnTop: false,
                    },
                }}
                loading={
                    <div className={`flex items-center justify-center h-full ${isDark ? 'bg-[#1e1e1e] text-zinc-500' : 'bg-white text-zinc-400'}`}>
                        <div className="animate-pulse">Loading editor…</div>
                    </div>
                }
            />
        </div>
    );
}
