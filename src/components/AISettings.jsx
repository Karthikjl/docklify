'use client';

import { useState, useEffect } from 'react';
import { saveApiKey, loadApiKey, saveModel, loadModel } from '../utils/aiStorage';
import { listGeminiModels, PREFERRED_GEMINI_MODEL } from '../utils/aiService';
import { useDebounce } from '../hooks/useDebounce';
import { BotIcon } from './Icons';
import Dropdown from './Dropdown';

export default function AISettings({ isOpen, onClose, onSave }) {
    const [apiKey, setApiKey] = useState(() => loadApiKey());
    const [savedModel, setSavedModel] = useState(() => loadModel());
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    // Outcome of the last model lookup, tagged with the key it was made for
    const [lookup, setLookup] = useState(null);

    const trimmedKey = apiKey.trim();
    const debouncedKey = useDebounce(trimmedKey, 600);

    // Validate the key by loading the real model list from Gemini
    useEffect(() => {
        if (!isOpen || !debouncedKey) return;
        const controller = new AbortController();

        listGeminiModels(debouncedKey, controller.signal)
            .then((models) => setLookup({ key: debouncedKey, models }))
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setLookup({ key: debouncedKey, error: err.message });
            });

        return () => controller.abort();
    }, [isOpen, debouncedKey]);

    const lookupIsCurrent = lookup?.key === trimmedKey && debouncedKey === trimmedKey;
    const status = !trimmedKey
        ? 'idle'
        : !lookupIsCurrent
            ? 'checking'
            : lookup.error
                ? 'invalid'
                : 'valid';

    const models = status === 'valid' ? lookup.models : [];
    const modelOptions = models.map((m) => ({ value: m.id, label: m.name, description: m.id }));

    // Saved choice if it still exists, otherwise the preferred default, otherwise the first model
    const model = models.some((m) => m.id === savedModel)
        ? savedModel
        : models.some((m) => m.id === PREFERRED_GEMINI_MODEL)
            ? PREFERRED_GEMINI_MODEL
            : models[0]?.id || '';

    const handleSave = () => {
        if (status !== 'valid' || !model) {
            setError('Enter a valid API key and choose a model');
            return;
        }

        saveApiKey(trimmedKey);
        saveModel(model);
        onSave(trimmedKey, model);
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
                                placeholder="AIza..."
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

                    {/* Key status */}
                    {status === 'checking' && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Checking API key…</p>
                    )}
                    {status === 'invalid' && (
                        <p className="text-[11px] text-red-600 dark:text-red-400">{lookup.error}</p>
                    )}

                    {/* Model selection: only once the key is verified */}
                    {status === 'valid' && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                                Model
                                <span className="ml-1.5 font-normal text-zinc-400 dark:text-zinc-500">
                                    ({models.length} available)
                                </span>
                            </label>
                            <Dropdown
                                label="Gemini model"
                                searchable
                                options={modelOptions}
                                value={model}
                                onChange={setSavedModel}
                            />
                        </div>
                    )}

                    {/* Privacy notice */}
                    <div className="bg-zinc-50 dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800/80 rounded-md p-2.5">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Your API key is saved locally in this browser only and is sent only to Google's Gemini API.
                        </p>
                    </div>

                    {/* Help Link */}
                    <div className="text-[11px] text-zinc-500">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-700 dark:text-zinc-300 hover:underline"
                        >
                            Get a Google Gemini API key →
                        </a>
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
                        disabled={status !== 'valid' || !model}
                        className="disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
