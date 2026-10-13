'use client';

import { useState } from 'react';
import { saveProvider, saveApiKey, loadProvider, loadApiKey } from '../utils/aiStorage';
import { BotIcon } from './Icons';

export default function AISettings({ isOpen, onClose, onSave }) {
    const [provider, setProvider] = useState(() => loadProvider());
    const [apiKey, setApiKey] = useState(() => loadApiKey());
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!apiKey || apiKey.trim().length === 0) {
            setError('Please enter an API key');
            return;
        }

        if (provider === 'gemini' && !apiKey.startsWith('AIza')) {
            setError('Gemini API keys typically start with "AIza"');
            return;
        }

        if (provider === 'openai' && !apiKey.startsWith('sk-')) {
            setError('OpenAI API keys start with "sk-"');
            return;
        }

        saveProvider(provider);
        saveApiKey(apiKey);
        onSave(provider, apiKey);
        onClose();
    };

    const handleCancel = () => {
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={handleCancel}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#0e0e11] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-700 dark:text-zinc-300">
                            <BotIcon size={16} />
                        </span>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            AI Configuration
                        </h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        aria-label="Close"
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs p-1 rounded transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3.5">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        >
                            <option value="gemini">Google Gemini (Free tier available)</option>
                            <option value="openai">OpenAI (GPT-4o)</option>
                        </select>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setError('');
                                }}
                                placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
                                className="w-full text-xs px-3 py-2 pr-12 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                aria-label={showKey ? 'Hide key' : 'Show key'}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 select-none px-1"
                            >
                                {showKey ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {/* Privacy notice */}
                    <div className="bg-zinc-50 dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800/80 rounded-md p-2.5">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Your API key is saved locally in this browser only. It is never transmitted to any third-party server.
                        </p>
                    </div>

                    {/* Help Link */}
                    <div className="text-[11px] text-zinc-500">
                        {provider === 'gemini' ? (
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-700 dark:text-zinc-300 hover:underline"
                            >
                                Get a Google Gemini API key →
                            </a>
                        ) : (
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-700 dark:text-zinc-300 hover:underline"
                            >
                                Get an OpenAI API key →
                            </a>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md p-2 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
