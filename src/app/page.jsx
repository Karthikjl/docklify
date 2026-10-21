'use client';

import MarkdownPage from '../views/MarkdownPage';
import { useEditor } from '../context/EditorContext';

export default function HomePage() {
    const editor = useEditor();

    return (
        <MarkdownPage
            markdown={editor.markdown}
            setMarkdown={editor.setMarkdown}
            theme={editor.theme}
            fontSize={editor.fontSize}
            scrollSync={editor.scrollSync}
            editorTheme={editor.editorTheme}
            onGenerate={editor.openGenerate}
        />
    );
}
