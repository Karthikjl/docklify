import { useState, useEffect } from 'react';
import { saveProvider, saveApiKey, loadProvider, loadApiKey } from '../utils/aiStorage';

export default function AISettings({ isOpen, onClose, onSave }) {
    const [provider, setProvider] = useState('gemini');
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');

    // Load saved settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setProvider(loadProvider());
            setApiKey(loadApiKey());
            setError('');
            setShowKey(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        // Validation
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

        // Save to localStorage
        saveProvider(provider);
        saveApiKey(apiKey);

        // Notify parent
        onSave(provider, apiKey);
        onClose();
    };

    const handleCancel = () => {
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl border border-dark-300 dark:border-dark-600 p-6 animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        🤖 AI Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="btn-ghost p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            AI Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="input w-full"
                        >
                            <option value="gemini">🔷 Google Gemini (Free tier available)</option>
                            <option value="openai">🟢 OpenAI GPT (Paid)</option>
                        </select>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
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
                                className="input w-full pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
                                title={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                        <p className="text-xs text-primary-700 dark:text-primary-300">
                            <strong>🔒 Privacy:</strong> Your API key is stored locally in your browser only.
                            It never leaves your device or gets sent to any server except the AI provider you choose.
                        </p>
                    </div>

                    {/* Get API Key Links */}
                    <div className="text-xs text-dark-600 dark:text-dark-400">
                        <p className="mb-1">Don't have an API key?</p>
                        <div className="flex gap-3">
                            {provider === 'gemini' && (
                                <a
                                    href="https://makersuite.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Get Gemini API Key →
                                </a>
                            )}
                            {provider === 'openai' && (
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Get OpenAI API Key →
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                ⚠️ {error}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary flex-1"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
