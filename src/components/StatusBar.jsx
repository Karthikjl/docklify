import { getWordCount, getCharCount, getLineCount } from '../utils/markdownParser';

export default function StatusBar({ markdown }) {
    const wordCount  = getWordCount(markdown);
    const charCount  = getCharCount(markdown);
    const lineCount  = getLineCount(markdown);

    const stats = [
        { icon: '📏', label: 'Lines',      value: lineCount },
        { icon: '📝', label: 'Words',      value: wordCount },
        { icon: '🔤', label: 'Characters', value: charCount },
    ];

    return (
        <div
            className="glass-strong border-t border-slate-200/50 dark:border-white/10 px-3 md:px-6 py-2 flex items-center justify-between text-sm text-dark-600 dark:text-dark-400"
            style={{ animation: 'slideInDown 0.35s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
        >
            <div className="flex items-center gap-3 md:gap-6">
                {stats.map(({ icon, label, value }, i) => (
                    <div
                        key={label}
                        className="flex items-center gap-2"
                        style={{ animation: `fadeSlideUp 0.4s ${0.25 + i * 0.06}s cubic-bezier(0.16,1,0.3,1) both` }}
                    >
                        <span className="font-medium hidden sm:inline">{label}:</span>
                        <span className="sm:hidden">{icon}</span>
                        <span
                            className="font-mono stat-number"
                            key={value}
                            style={{ animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
                        >
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            <div
                className="text-xs hidden md:flex items-center gap-1"
                style={{ animation: 'fadeSlideUp 0.4s 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
            >
                <span style={{ animation: 'pulseGlow 2.5s ease-in-out infinite', borderRadius: '50%', display: 'inline-block' }}>💾</span>
                <span>Auto-save enabled</span>
            </div>
        </div>
    );
}
