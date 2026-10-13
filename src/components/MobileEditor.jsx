'use client';

import { EDITOR_THEMES } from '../utils/editorThemes';

// Build mobile colours from the same EDITOR_THEMES data Monaco uses
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

/**
 * Mobile textarea fallback (Monaco is not fully supported on mobile touch browsers)
 */
export default function MobileEditor({ value, onChange, editorTheme, fontSize, language }) {
    const s = getMobileStyle(editorTheme);

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: s.bg,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
        }}>
            {/* Language badge */}
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
                    WebkitTextFillColor: s.fg,
                }}
            />

            {/* Theme indicator bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 12px',
                background: s.bg,
                borderTop: `1px solid ${s.lineNum}30`,
                flexShrink: 0,
            }}>
                <span style={{ fontSize: '0.68rem', color: s.lineNum, fontFamily: 'monospace' }}>
                    <strong style={{ color: s.fg }}>{editorTheme}</strong>
                </span>
                <span style={{ fontSize: '0.65rem', color: s.lineNum }}>
                    {language.toUpperCase()}
                </span>
            </div>
        </div>
    );
}
