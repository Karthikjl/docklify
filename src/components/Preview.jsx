import { useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/markdownParser';
import mermaid from 'mermaid';

export default function Preview({ markdown, theme, fontSize }) {
    const previewRef = useRef(null);

    // Initialize Mermaid
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: theme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
        });
    }, [theme]);

    // Render markdown and process Mermaid diagrams
    useEffect(() => {
        if (!previewRef.current) return;

        const html = parseMarkdown(markdown);
        previewRef.current.innerHTML = html;

        // Find all code blocks that contain mermaid syntax
        const allCodeBlocks = previewRef.current.querySelectorAll('pre > code');
        const mermaidBlocks = Array.from(allCodeBlocks).filter(code => {
            const text = code.textContent.trim();
            return text.startsWith('graph ') ||
                text.startsWith('sequenceDiagram') ||
                text.startsWith('classDiagram') ||
                text.startsWith('stateDiagram') ||
                text.startsWith('erDiagram') ||
                text.startsWith('journey') ||
                text.startsWith('gantt') ||
                text.startsWith('pie') ||
                text.startsWith('flowchart');
        });

        mermaidBlocks.forEach((element, index) => {
            const code = element.textContent;
            const id = `mermaid-${Date.now()}-${index}`;

            // Create container for mermaid diagram
            const container = document.createElement('div');
            container.className = 'mermaid-container my-6 flex justify-center';
            container.id = id;

            // Replace code block with container
            const pre = element.parentElement;
            if (pre && pre.tagName === 'PRE') {
                pre.replaceWith(container);

                // Render mermaid diagram
                try {
                    mermaid.render(`mermaid-svg-${id}`, code).then(({ svg }) => {
                        container.innerHTML = svg;
                    }).catch((error) => {
                        console.error('Mermaid rendering error:', error);
                        container.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded">
              <strong>Mermaid Error:</strong> ${error.message}
            </div>`;
                    });
                } catch (error) {
                    console.error('Mermaid error:', error);
                    container.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded">
            <strong>Mermaid Error:</strong> ${error.message}
          </div>`;
                }
            }
        });

        // Make task list checkboxes interactive (read-only)
        const checkboxes = previewRef.current.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }, [markdown]);

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar bg-white dark:bg-dark-900">
            <div
                ref={previewRef}
                className="markdown-preview p-8 animate-in"
                style={{ fontSize: `${fontSize}px` }}
            />
        </div>
    );
}
