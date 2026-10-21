'use client';

import MermaidPage from '../../views/MermaidPage';
import { useEditor } from '../../context/EditorContext';

export default function MermaidRoute() {
    const editor = useEditor();

    return (
        <MermaidPage
            mermaidContent={editor.mermaidContent}
            setMermaidContent={editor.setMermaidContent}
            mermaidTheme={editor.mermaidTheme}
            onMermaidThemeChange={editor.handleMermaidThemeChange}
            theme={editor.theme}
            fontSize={editor.fontSize}
            editorTheme={editor.editorTheme}
            onGenerate={editor.openGenerate}
            toast={editor.toast}
        />
    );
}
