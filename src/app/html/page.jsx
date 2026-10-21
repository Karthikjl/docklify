'use client';

import HtmlPage from '../../views/HtmlPage';
import { useEditor } from '../../context/EditorContext';

export default function HtmlRoute() {
    const editor = useEditor();

    return (
        <HtmlPage
            htmlContent={editor.htmlContent}
            setHtmlContent={editor.setHtmlContent}
            htmlCode={editor.htmlCode}
            setHtmlCode={editor.setHtmlCode}
            cssCode={editor.cssCode}
            setCssCode={editor.setCssCode}
            jsCode={editor.jsCode}
            setJsCode={editor.setJsCode}
            theme={editor.theme}
            fontSize={editor.fontSize}
            scrollSync={editor.scrollSync}
            editorTheme={editor.editorTheme}
            activeTab={editor.activeHtmlTab}
            setActiveTab={editor.setActiveHtmlTab}
            onGenerate={editor.openGenerate}
        />
    );
}
