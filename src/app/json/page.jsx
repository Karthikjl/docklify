'use client';

import JsonPage from '../../views/JsonPage';
import { useEditor } from '../../context/EditorContext';

export default function JsonRoute() {
    const editor = useEditor();

    return (
        <JsonPage
            jsonContent={editor.jsonContent}
            setJsonContent={editor.setJsonContent}
            theme={editor.theme}
            fontSize={editor.fontSize}
            scrollSync={editor.scrollSync}
            editorTheme={editor.editorTheme}
        />
    );
}
