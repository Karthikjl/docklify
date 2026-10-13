'use client';

import HtmlPage from '../../views/HtmlPage';
import { useEditor } from '../../context/EditorContext';

export default function HtmlRoute() {
    const editor = useEditor();

    return (
        <HtmlPage
            htmlContent={editor.htmlContent}
            setHtmlContent={editor.setHtmlContent}
            theme={editor.theme}
            fontSize={editor.fontSize}
            scrollSync={editor.scrollSync}
            editorTheme={editor.editorTheme}
        />
    );
}
