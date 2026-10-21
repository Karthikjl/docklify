'use client';

import { useState, useEffect, useMemo } from 'react';
import Editor from '../components/Editor';
import ResizablePanels from '../components/ResizablePanels';
import { useDebounce } from '../hooks/useDebounce';
import { FormatIcon, CopyIcon, CheckIcon, AlertCircleIcon } from '../components/Icons';
import { copyHTMLToClipboard } from '../utils/exportUtils';

import Tooltip from '../components/Tooltip';
import { useFullscreen } from '../hooks/useFullscreen';
import FullscreenButton from '../components/FullscreenButton';

export default function JsonPage({ jsonContent, setJsonContent, theme, fontSize, scrollSync, editorTheme }) {
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const debouncedJson = useDebounce(jsonContent, 100);
    const [lastValidParsed, setLastValidParsed] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [outputMode, setOutputMode] = useState('format'); // 'format' | 'minify'
    const [copied, setCopied] = useState(false);

    const isEmpty = !debouncedJson?.trim();

    useEffect(() => {
        if (isEmpty) {
            setLastValidParsed(null);
            setParseError(null);
            return;
        }

        try {
            const parsed = JSON.parse(debouncedJson);
            setLastValidParsed(parsed);
            setParseError(null);
        } catch (err) {
            setParseError(err.message);
        }
    }, [debouncedJson, isEmpty]);

    const rightContent = useMemo(() => {
        if (isEmpty) return '';
        if (lastValidParsed !== null) {
            return outputMode === 'minify'
                ? JSON.stringify(lastValidParsed)
                : JSON.stringify(lastValidParsed, null, 2);
        }
        return debouncedJson;
    }, [isEmpty, lastValidParsed, outputMode, debouncedJson]);

    const handleCopy = async () => {
        if (!rightContent) return;
        try {
            await copyHTMLToClipboard(rightContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy JSON:', error);
        }
    };

    return (
        <div className="h-full">
            <ResizablePanels
                previewExpanded={isFullscreen}
                theme={theme}
                leftPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800">
                        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0d0d10]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Raw JSON
                            </h2>
                        </div>
                        <Editor
                            value={jsonContent}
                            onChange={setJsonContent}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={scrollSync}
                            language="json"
                            editorTheme={editorTheme}
                        />
                    </div>
                }
                rightPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
                        <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0d0d10] gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                    {outputMode === 'minify' ? 'Minified JSON' : 'Formatted JSON'}
                                </h2>
                                {isEmpty ? (
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                        Empty
                                    </span>
                                ) : parseError ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        Invalid JSON
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {outputMode === 'minify' ? 'Minified' : 'Formatted'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Format / Minify segmented toggle for right-side display */}
                                <div className="flex items-center p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215]">
                                    <Tooltip content="Format JSON (pretty print with indentation)">
                                        <button
                                            onClick={() => setOutputMode('format')}
                                            aria-label="Format JSON"
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                                outputMode === 'format'
                                                    ? 'bg-white dark:bg-[#202025] text-zinc-900 dark:text-zinc-100 shadow-xs'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                            }`}
                                        >
                                            <FormatIcon size={12} className="opacity-70" />
                                            Format
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Minify JSON (compact to single line)">
                                        <button
                                            onClick={() => setOutputMode('minify')}
                                            aria-label="Minify JSON"
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                                outputMode === 'minify'
                                                    ? 'bg-white dark:bg-[#202025] text-zinc-900 dark:text-zinc-100 shadow-xs'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                            }`}
                                        >
                                            Minify
                                        </button>
                                    </Tooltip>
                                </div>

                                <Tooltip content="Copy JSON to clipboard" align="end">
                                    <button
                                        onClick={handleCopy}
                                        disabled={isEmpty || !rightContent}
                                        aria-label="Copy JSON"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckIcon size={12} className="text-emerald-500" />
                                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <CopyIcon size={12} className="opacity-70" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </Tooltip>

                                <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
                            </div>
                        </div>

                        {parseError && (
                            <div className="px-4 py-2 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                                <AlertCircleIcon size={13} className="flex-shrink-0 text-red-500" />
                                <span className="font-mono truncate">{parseError}</span>
                            </div>
                        )}

                        <div className="flex-1 relative overflow-hidden">
                            <Editor
                                value={rightContent}
                                onChange={() => {}}
                                theme={theme}
                                fontSize={fontSize}
                                scrollSync={scrollSync}
                                language="json"
                                editorTheme={editorTheme}
                                readOnly={true}
                                isSecondary={true}
                            />
                        </div>
                    </div>
                }
            />
        </div>
    );
}
