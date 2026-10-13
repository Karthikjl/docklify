'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { EDITOR_THEMES } from '../utils/editorThemes';
import { useWindowWidth } from '../hooks/useWindowWidth';

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
export default function Editor({ value, onChange, fontSize, scrollSync, language = 'markdown', editorTheme = 'vs-dark' }) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const scrollSyncRef = useRef(scrollSync);
    const isSyncingRef = useRef(false);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    useEffect(() => {
        scrollSyncRef.current = scrollSync;
    }, [scrollSync]);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;

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
            fontSize,
            fontFamily: '"Fira Code", monospace',
            lineNumbers: 'on',
            minimap: { enabled: windowWidth >= 1200 },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: false,
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'off',
            renderValidationDecorations: 'editable',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            maxTokenizationLineLength: 20000,
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            console.log('Auto-save enabled');
        });

        let scrollRaf = null;
        editor.onDidScrollChange((e) => {
            if (!scrollSyncRef.current || isSyncingRef.current) return;
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = null;
                if (!editorRef.current) return;
                const scrollTop = e.scrollTop;
                const scrollHeight = editorRef.current.getScrollHeight();
                const clientHeight = editorRef.current.getLayoutInfo().height;
                const maxScroll = scrollHeight - clientHeight;
                if (maxScroll <= 0) return;
                window.dispatchEvent(new CustomEvent('editor-scroll', {
                    detail: { scrollPercentage: scrollTop / maxScroll }
                }));
            });
        });
    }

    useEffect(() => {
        if (editorRef.current) editorRef.current.updateOptions({ fontSize });
    }, [fontSize]);

    useEffect(() => {
        if (monacoRef.current) monacoRef.current.editor.setTheme(editorTheme);
    }, [editorTheme]);

    useEffect(() => {
        const handlePreviewScroll = (event) => {
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
        window.addEventListener('preview-scroll', handlePreviewScroll);
        return () => window.removeEventListener('preview-scroll', handlePreviewScroll);
    }, []);

    // ── Mobile / Android: native textarea (Monaco is broken on Android) ──
    if (isMobile) {
        return (
            <MobileEditor
                value={value}
                onChange={onChange}
                editorTheme={editorTheme}
                fontSize={fontSize}
                language={language}
            />
        );
    }

    // ── Desktop: full Monaco editor ──────────────────────────────
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
                    fontSize,
                    fontFamily: '"Fira Code", monospace',
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
                loading={
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-dark-500">Loading editor…</div>
                    </div>
                }
            />
        </div>
    );
}
