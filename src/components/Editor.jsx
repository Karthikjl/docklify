import { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { EDITOR_THEMES } from '../utils/editorThemes';

// Build mobile colours from the same EDITOR_THEMES data Monaco uses
// so they always stay in sync — no key mismatches possible.
function getMobileStyle(editorThemeId) {
    const found = EDITOR_THEMES.find(t => t.id === editorThemeId);
    if (found?.data?.colors) {
        const c = found.data.colors;
        return {
            bg: c['editor.background'] || '#1e1e1e',
            fg: c['editor.foreground'] || '#d4d4d4',
            caret: c['editorCursor.foreground'] || '#aeafad',
            lineNum: c['editorLineNumber.foreground'] || '#858585',
        };
    }
    // Built-in Monaco themes (vs, vs-dark) have no data object — use hardcoded fallbacks
    const builtIn = {
        'vs': { bg: '#ffffff', fg: '#000000', caret: '#000000', lineNum: '#237893' },
        'vs-dark': { bg: '#1e1e1e', fg: '#d4d4d4', caret: '#aeafad', lineNum: '#858585' },
    };
    return builtIn[editorThemeId] || builtIn['vs-dark'];
}

function useWindowWidth() {
    const [w, setW] = useState(() => window.innerWidth);
    useEffect(() => {
        const h = () => setW(window.innerWidth);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);
    return w;
}

// ── Mobile textarea fallback (Monaco doesn't work on Android) ────
function MobileEditor({ value, onChange, editorTheme, fontSize, language }) {
    const s = getMobileStyle(editorTheme);

    return (
        // The outer div MUST also carry the theme bg so it overrides glass-panel's backdrop
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: s.bg,           // <-- key: override glass-panel here
            backdropFilter: 'none',     // disable glass effect inside editor
            WebkitBackdropFilter: 'none',
        }}>
            {/* Language badge (top-right) */}
            <div style={{
                position: 'absolute', top: 8, right: 10, zIndex: 2,
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: s.lineNum,
                background: s.bg, padding: '2px 7px', borderRadius: '6px',
                border: `1px solid ${s.lineNum}44`,
                pointerEvents: 'none',
            }}>
                {language}
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                style={{
                    flex: 1,
                    width: '100%',
                    resize: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: '"Fira Code", "Fira Mono", "Cascadia Code", monospace',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.6,
                    padding: '16px 14px',
                    background: s.bg,
                    color: s.fg,
                    caretColor: s.caret,
                    tabSize: 4,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    whiteSpace: 'pre',
                    wordWrap: 'off',
                    boxSizing: 'border-box',
                    // Force override any inherited glass colours
                    WebkitTextFillColor: s.fg,
                }}
            />

            {/* Theme indicator bar (bottom) */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 12px',
                background: s.bg,
                borderTop: `1px solid ${s.lineNum}30`,
                flexShrink: 0,
            }}>
                <span style={{ fontSize: '0.68rem', color: s.lineNum, fontFamily: 'monospace' }}>
                    🎨 <strong style={{ color: s.fg }}>{editorTheme}</strong>
                </span>
                <span style={{ fontSize: '0.65rem', color: s.lineNum }}>
                    {language.toUpperCase()}
                </span>
            </div>
        </div>
    );
}

// ── Main Editor component ─────────────────────────────────────────
export default function Editor({ value, onChange, theme, fontSize, scrollSync, language = 'markdown', editorTheme = 'vs-dark' }) {
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
            if (data) { try { monaco.editor.defineTheme(id, data); } catch (_) { } }
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
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            console.log('Auto-save enabled');
        });

        editor.onDidScrollChange((e) => {
            if (!scrollSyncRef.current || isSyncingRef.current) return;
            const scrollTop = e.scrollTop;
            const scrollHeight = editor.getScrollHeight();
            const clientHeight = editor.getLayoutInfo().height;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll <= 0) return;
            window.dispatchEvent(new CustomEvent('editor-scroll', {
                detail: { scrollPercentage: scrollTop / maxScroll }
            }));
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
