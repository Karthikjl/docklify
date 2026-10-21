/**
 * Monaco syntax highlighting for Mermaid (Monaco has no built-in Mermaid language)
 */

const DIAGRAM_TYPES = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'classDiagram-v2',
    'stateDiagram', 'stateDiagram-v2', 'erDiagram', 'journey', 'gantt', 'pie',
    'gitGraph', 'mindmap', 'timeline', 'quadrantChart', 'requirementDiagram',
    'sankey-beta', 'xychart-beta', 'block-beta', 'architecture-beta', 'C4Context',
];

const KEYWORDS = [
    'subgraph', 'end', 'participant', 'actor', 'as', 'loop', 'alt', 'else', 'opt',
    'par', 'and', 'rect', 'critical', 'break', 'note', 'Note', 'over', 'of', 'activate',
    'deactivate', 'autonumber', 'class', 'state', 'direction', 'title', 'section',
    'dateFormat', 'axisFormat', 'style', 'classDef', 'linkStyle', 'click', 'link',
    'branch', 'checkout', 'commit', 'merge', 'showData',
    'left', 'right', 'TB', 'TD', 'BT', 'RL', 'LR',
];

export const MERMAID_LANGUAGE_ID = 'mermaid';

export function registerMermaidLanguage(monaco) {
    if (monaco.languages.getLanguages().some((l) => l.id === MERMAID_LANGUAGE_ID)) return;

    monaco.languages.register({ id: MERMAID_LANGUAGE_ID });
    monaco.languages.setLanguageConfiguration(MERMAID_LANGUAGE_ID, {
        comments: { lineComment: '%%' },
        brackets: [['{', '}'], ['[', ']'], ['(', ')']],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
        ],
    });

    monaco.languages.setMonarchTokensProvider(MERMAID_LANGUAGE_ID, {
        diagramTypes: DIAGRAM_TYPES,
        keywords: KEYWORDS,
        tokenizer: {
            root: [
                [/%%.*$/, 'comment'],
                [/"[^"]*"/, 'string'],
                [/\|[^|\n]*\|/, 'string'],
                // Arrows and links: -->, ---, -.->, ==>, ->>, -->>, --x, --o, <|--, ..>, ||--o{ ...
                [/[<|}]?[|o]?[-=.]{2,}[>xo|{]?/, 'operator'],
                [/->>?|-\)/, 'operator'],
                [/:::/, 'operator'],
                [/[{}()[\]]/, 'delimiter.bracket'],
                [/\d+(\.\d+)?/, 'number'],
                [/(?:classDiagram-v2|stateDiagram-v2|sankey-beta|xychart-beta|block-beta|architecture-beta|cherry-pick)\b/, 'keyword'],
                [/[A-Za-z_]\w*/, {
                    cases: {
                        '@diagramTypes': 'keyword',
                        '@keywords': 'keyword',
                        '@default': 'identifier',
                    },
                }],
            ],
        },
    });
}
