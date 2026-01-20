/**
 * AI Storage Utilities
 * Secure localStorage management for AI settings
 */

const STORAGE_KEYS = {
    AI_PROVIDER: 'markdown-viewer-ai-provider',
    AI_API_KEY: 'markdown-viewer-ai-key',
    AI_MODE: 'markdown-viewer-ai-mode',
};

/**
 * Save AI provider
 * @param {string} provider - 'gemini' or 'openai'
 */
export function saveProvider(provider) {
    try {
        localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, provider);
    } catch (error) {
        console.error('Error saving AI provider:', error);
    }
}

/**
 * Load AI provider
 * @returns {string} - Saved provider or 'gemini' as default
 */
export function loadProvider() {
    try {
        return localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'gemini';
    } catch (error) {
        console.error('Error loading AI provider:', error);
        return 'gemini';
    }
}

/**
 * Save API key
 * @param {string} apiKey - API key to save
 */
export function saveApiKey(apiKey) {
    try {
        localStorage.setItem(STORAGE_KEYS.AI_API_KEY, apiKey);
    } catch (error) {
        console.error('Error saving API key:', error);
    }
}

/**
 * Load API key
 * @returns {string} - Saved API key or empty string
 */
export function loadApiKey() {
    try {
        return localStorage.getItem(STORAGE_KEYS.AI_API_KEY) || '';
    } catch (error) {
        console.error('Error loading API key:', error);
        return '';
    }
}

/**
 * Save AI mode state
 * @param {boolean} enabled - AI mode enabled state
 */
export function saveAIMode(enabled) {
    try {
        localStorage.setItem(STORAGE_KEYS.AI_MODE, enabled.toString());
    } catch (error) {
        console.error('Error saving AI mode:', error);
    }
}

/**
 * Load AI mode state
 * @returns {boolean} - Saved AI mode state
 */
export function loadAIMode() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.AI_MODE);
        return saved === 'true';
    } catch (error) {
        console.error('Error loading AI mode:', error);
        return false;
    }
}

/**
 * Clear all AI settings
 */
export function clearAISettings() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing AI settings:', error);
    }
}

/**
 * Check if API key is configured
 * @returns {boolean}
 */
export function hasApiKey() {
    const key = loadApiKey();
    return key && key.length > 0;
}
