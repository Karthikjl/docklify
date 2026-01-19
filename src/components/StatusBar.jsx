import { getWordCount, getCharCount, getLineCount } from '../utils/markdownParser';

export default function StatusBar({ markdown }) {
    const wordCount = getWordCount(markdown);
    const charCount = getCharCount(markdown);
    const lineCount = getLineCount(markdown);

    return (
        <div className="glass border-t border-dark-200 dark:border-dark-700 px-6 py-2 flex items-center justify-between text-sm text-dark-600 dark:text-dark-400">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Lines:</span>
                    <span className="font-mono">{lineCount}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-medium">Words:</span>
                    <span className="font-mono">{wordCount}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-medium">Characters:</span>
                    <span className="font-mono">{charCount}</span>
                </div>
            </div>

            <div className="text-xs">
                💾 Auto-save enabled
            </div>
        </div>
    );
}
