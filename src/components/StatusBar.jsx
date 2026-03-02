import { getWordCount, getCharCount, getLineCount } from '../utils/markdownParser';

export default function StatusBar({ markdown }) {
    const wordCount = getWordCount(markdown);
    const charCount = getCharCount(markdown);
    const lineCount = getLineCount(markdown);

    return (
        <div className="glass-strong border-t border-slate-200/50 dark:border-white/10 px-3 md:px-6 py-2 flex items-center justify-between text-sm text-dark-600 dark:text-dark-400">
            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-medium hidden sm:inline">Lines:</span>
                    <span className="sm:hidden">📏</span>
                    <span className="font-mono">{lineCount}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-medium hidden sm:inline">Words:</span>
                    <span className="sm:hidden">📝</span>
                    <span className="font-mono">{wordCount}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-medium hidden sm:inline">Characters:</span>
                    <span className="sm:hidden">🔤</span>
                    <span className="font-mono">{charCount}</span>
                </div>
            </div>

            <div className="text-xs hidden md:block">
                💾 Auto-save enabled
            </div>
        </div>
    );
}
