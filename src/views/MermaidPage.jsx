'use client';

import { useState, useEffect, useMemo } from 'react';
import Editor from '../components/Editor';
import ResizablePanels from '../components/ResizablePanels';
import PanZoomViewer from '../components/PanZoomViewer';
import Dropdown from '../components/Dropdown';
import Tooltip from '../components/Tooltip';
import FullscreenButton from '../components/FullscreenButton';
import GenerateButton from '../components/GenerateButton';
import { CopyIcon, CheckIcon, AlertCircleIcon, DownloadIcon } from '../components/Icons';
import { useDebounce } from '../hooks/useDebounce';
import { useFullscreen } from '../hooks/useFullscreen';
import { copyHTMLToClipboard } from '../utils/exportUtils';
import { GENERATE_CONFIG, undoHint } from '../utils/generateConfig';
import { MERMAID_EXAMPLES } from '../utils/mermaidExamples';
import {
    MERMAID_THEMES,
    renderMermaid,
    describeMermaidError,
    getDiagramBackground,
    svgToPngBlob,
    downloadBlob,
} from '../utils/mermaidRenderer';

const BUTTON_CLASS =
    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none disabled:opacity-40 disabled:cursor-not-allowed';

export default function MermaidPage({
    mermaidContent,
    setMermaidContent,
    mermaidTheme,
    onMermaidThemeChange,
    theme,
    fontSize,
    editorTheme,
    onGenerate,
    toast,
}) {
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const debouncedCode = useDebounce(mermaidContent, 250);
    const isEmpty = !debouncedCode?.trim();

    // Last successful render plus the current error (the last good diagram stays visible while you fix a typo)
    const [rendered, setRendered] = useState({ diagram: null, error: null });
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(null); // 'svg' | 'png' | null

    useEffect(() => {
        if (isEmpty) return;
        let cancelled = false;

        renderMermaid(debouncedCode, { appTheme: theme, mermaidTheme })
            .then((diagram) => {
                if (!cancelled) setRendered({ diagram, error: null });
            })
            .catch((err) => {
                if (!cancelled) setRendered((prev) => ({ ...prev, error: describeMermaidError(err) }));
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedCode, isEmpty, theme, mermaidTheme]);

    const { diagram, error } = rendered;
    const background = getDiagramBackground(theme, mermaidTheme);
    const markers = useMemo(
        () => (!isEmpty && error?.line ? [{ line: error.line, message: error.message }] : []),
        [isEmpty, error]
    );

    const exampleOptions = MERMAID_EXAMPLES.map((e) => ({ value: e.value, label: e.label }));

    const loadExample = (value) => {
        const example = MERMAID_EXAMPLES.find((e) => e.value === value);
        if (!example) return;
        setMermaidContent(example.code);
        toast?.info(`Loaded the ${example.label.toLowerCase()} example.${undoHint()}`, 'Example');
    };

    // Export what is in the editor right now (portable SVG: no HTML labels or web fonts)
    const renderForExport = () =>
        renderMermaid(mermaidContent, { appTheme: theme, mermaidTheme, forExport: true });

    const runExport = async (kind, task) => {
        if (!mermaidContent.trim()) {
            toast?.warning('There is no diagram to export yet.', 'Nothing to export');
            return;
        }
        setBusy(kind);
        try {
            await task();
        } catch (err) {
            toast?.error(describeMermaidError(err).message, 'Export Error');
        } finally {
            setBusy(null);
        }
    };

    const handleDownloadSvg = () =>
        runExport('svg', async () => {
            const { svg } = await renderForExport();
            downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'diagram.svg');
        });

    const handleDownloadPng = () =>
        runExport('png', async () => {
            const { svg, width, height } = await renderForExport();
            const blob = await svgToPngBlob(svg, { width, height, scale: 2, background });
            downloadBlob(blob, 'diagram.png');
        });

    const handleCopySvg = () =>
        runExport('svg', async () => {
            const { svg } = await renderForExport();
            await copyHTMLToClipboard(svg);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });

    const statusBadge = isEmpty ? (
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Empty</span>
    ) : error ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Syntax error
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Rendered
        </span>
    );

    return (
        <div className="h-full">
            <ResizablePanels
                previewExpanded={isFullscreen}
                theme={theme}
                leftPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800">
                        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-2 bg-zinc-50/50 dark:bg-[#0d0d10] min-h-[41px]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Mermaid Editor
                            </h2>
                            <div className="flex items-center gap-2">
                                <GenerateButton onClick={onGenerate} tooltip={GENERATE_CONFIG.mermaid.tooltip} />
                                <div className="w-40">
                                    <Dropdown
                                        label="Load an example diagram"
                                        placeholder="Examples…"
                                        options={exampleOptions}
                                        value=""
                                        onChange={loadExample}
                                    />
                                </div>
                            </div>
                        </div>
                        <Editor
                            value={mermaidContent}
                            onChange={setMermaidContent}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={false}
                            language="mermaid"
                            editorTheme={editorTheme}
                            markers={markers}
                        />
                    </div>
                }
                rightPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
                        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0d0d10] flex flex-wrap justify-between items-center gap-2 min-h-[41px]">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                    Diagram
                                </h2>
                                {statusBadge}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <div className="w-36">
                                    <Dropdown
                                        label="Diagram theme"
                                        options={MERMAID_THEMES}
                                        value={mermaidTheme}
                                        onChange={onMermaidThemeChange}
                                    />
                                </div>
                                <Tooltip content="Copy SVG markup">
                                    <button
                                        type="button"
                                        onClick={handleCopySvg}
                                        disabled={isEmpty || busy !== null}
                                        aria-label="Copy SVG"
                                        className={BUTTON_CLASS}
                                    >
                                        {copied ? (
                                            <CheckIcon size={12} className="text-emerald-500" />
                                        ) : (
                                            <CopyIcon size={12} className="opacity-70" />
                                        )}
                                    </button>
                                </Tooltip>
                                <Tooltip content="Download as SVG (vector)">
                                    <button
                                        type="button"
                                        onClick={handleDownloadSvg}
                                        disabled={isEmpty || busy !== null}
                                        aria-label="Download SVG"
                                        className={BUTTON_CLASS}
                                    >
                                        <DownloadIcon size={12} className="opacity-70" />
                                        <span>{busy === 'svg' ? '…' : 'SVG'}</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Download as PNG (2x resolution)">
                                    <button
                                        type="button"
                                        onClick={handleDownloadPng}
                                        disabled={isEmpty || busy !== null}
                                        aria-label="Download PNG"
                                        className={BUTTON_CLASS}
                                    >
                                        <DownloadIcon size={12} className="opacity-70" />
                                        <span>{busy === 'png' ? '…' : 'PNG'}</span>
                                    </button>
                                </Tooltip>
                                <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
                            </div>
                        </div>

                        {!isEmpty && error && (
                            <div className="px-4 py-2 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
                                <AlertCircleIcon size={13} className="flex-shrink-0 text-red-500 mt-0.5" />
                                <div className="min-w-0">
                                    <pre className="font-mono whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
                                        {error.message}
                                    </pre>
                                    {diagram && (
                                        <p className="mt-1 text-[11px] opacity-80">Showing the last valid diagram.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 relative">
                            {isEmpty || !diagram ? (
                                <div className="h-full flex items-center justify-center p-8">
                                    <div className="text-center max-w-sm">
                                        <h3 className="text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                            {isEmpty ? 'No diagram' : 'Nothing to show yet'}
                                        </h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            {isEmpty
                                                ? 'Write Mermaid code on the left, or pick an example to get started.'
                                                : 'Fix the error above and the diagram will appear here.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <PanZoomViewer
                                    svg={diagram.svg}
                                    width={diagram.width}
                                    height={diagram.height}
                                    background={background}
                                />
                            )}
                        </div>
                    </div>
                }
            />
        </div>
    );
}
