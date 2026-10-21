'use client';

import { useState } from 'react';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import ResizablePanels from '../components/ResizablePanels';
import { formatHTML, formatCSS, formatJS } from '../renderers/htmlRenderer';
import { useDebounce } from '../hooks/useDebounce';
import { FormatIcon, HtmlIcon, CssIcon, JsIcon } from '../components/Icons';
import Tooltip from '../components/Tooltip';
import { useFullscreen } from '../hooks/useFullscreen';
import FullscreenButton from '../components/FullscreenButton';
import GenerateButton from '../components/GenerateButton';
import { GENERATE_CONFIG } from '../utils/generateConfig';

export default function HtmlPage({
    htmlContent = '',
    htmlCode = '',
    setHtmlCode,
    cssCode = '',
    setCssCode,
    jsCode = '',
    setJsCode,
    theme,
    fontSize,
    scrollSync,
    editorTheme,
    activeTab: controlledActiveTab,
    setActiveTab: controlledSetActiveTab,
    onGenerate,
}) {
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const [localActiveTab, setLocalActiveTab] = useState('html');
    const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
    const setActiveTab = controlledSetActiveTab || setLocalActiveTab;
    const debouncedHtml = useDebounce(htmlContent, 150);

    const handleFormat = () => {
        if (activeTab === 'html') {
            if (setHtmlCode) setHtmlCode(formatHTML(htmlCode));
        } else if (activeTab === 'css') {
            if (setCssCode) setCssCode(formatCSS(cssCode));
        } else if (activeTab === 'js') {
            if (setJsCode) setJsCode(formatJS(jsCode));
        }
    };

    const currentEditorConfig = {
        html: {
            value: htmlCode,
            onChange: setHtmlCode,
            language: 'html',
            formatLabel: 'Format HTML',
        },
        css: {
            value: cssCode,
            onChange: setCssCode,
            language: 'css',
            formatLabel: 'Format CSS',
        },
        js: {
            value: jsCode,
            onChange: setJsCode,
            language: 'javascript',
            formatLabel: 'Format JavaScript',
        },
    }[activeTab];

    return (
        <div className="h-full">
            <ResizablePanels
                previewExpanded={isFullscreen}
                theme={theme}
                leftPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800">
                        {/* Tab Switcher Header */}
                        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-2 bg-zinc-50/70 dark:bg-[#0d0d10] min-h-[41px]">
                            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/50">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('html')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                        activeTab === 'html'
                                            ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    <HtmlIcon size={13} className={activeTab === 'html' ? 'text-amber-500' : 'opacity-60'} />
                                    <span>HTML</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('css')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                        activeTab === 'css'
                                            ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    <CssIcon size={13} className={activeTab === 'css' ? 'text-sky-500' : 'opacity-60'} />
                                    <span>CSS</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('js')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                        activeTab === 'js'
                                            ? 'bg-white dark:bg-zinc-900 text-yellow-600 dark:text-yellow-400 shadow-sm'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    <JsIcon size={13} className={activeTab === 'js' ? 'text-yellow-500' : 'opacity-60'} />
                                    <span>Script</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <GenerateButton onClick={onGenerate} tooltip={GENERATE_CONFIG.html.tooltip} />
                                <Tooltip content={`${currentEditorConfig.formatLabel} (clean indentation)`} align="end">
                                    <button
                                        onClick={handleFormat}
                                        aria-label={currentEditorConfig.formatLabel}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
                                    >
                                        <FormatIcon size={12} className="opacity-70" />
                                        <span>Format {activeTab === 'html' ? 'HTML' : activeTab === 'css' ? 'CSS' : 'JS'}</span>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 min-h-0 bg-[#1e1e1e]">
                            <Editor
                                path={`index.${activeTab === 'js' ? 'js' : activeTab}`}
                                value={currentEditorConfig.value}
                                onChange={currentEditorConfig.onChange}
                                theme={theme}
                                fontSize={fontSize}
                                scrollSync={scrollSync}
                                language={currentEditorConfig.language}
                                editorTheme={editorTheme}
                            />
                        </div>
                    </div>
                }
                rightPanel={
                    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
                        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0d0d10] flex justify-between items-center min-h-[41px]">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                Rendered Preview
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    HTML + CSS + JS
                                </div>
                                <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
                            </div>
                        </div>
                        <Preview
                            content={debouncedHtml}
                            theme={theme}
                            fontSize={fontSize}
                            scrollSync={scrollSync}
                            language="html"
                        />
                    </div>
                }
            />
        </div>
    );
}

