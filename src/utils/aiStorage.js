/**
 * AI Storage Utilities
 * Secure localStorage management for AI settings
 */

const STORAGE_KEYS = {
    AI_MODEL: 'markdown-viewer-ai-model',
    AI_API_KEY: 'markdown-viewer-ai-key',
    AI_MODE: 'markdown-viewer-ai-mode',
};

const isBrowser = typeof window !== 'undefined';

/**
 * Save selected Gemini model id
 * @param {string} model - Model id, e.g. 'gemini-2.5-flash'
 */
export function saveModel(model) {
    if (!isBrowser) return;
    try {
        localStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
    } catch (error) {
        console.error('Error saving AI model:', error);
    }
}

/**
 * Load selected Gemini model id
 * @returns {string} - Saved model id or empty string
 */
export function loadModel() {
    if (!isBrowser) return '';
    try {
        return localStorage.getItem(STORAGE_KEYS.AI_MODEL) || '';
    } catch (error) {
        console.error('Error loading AI model:', error);
        return '';
    }
}

/**
 * Save API key
 * @param {string} apiKey - API key to save
 */
export function saveApiKey(apiKey) {
    if (!isBrowser) return;
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
    if (!isBrowser) return '';
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
    if (!isBrowser) return;
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
    if (!isBrowser) return false;
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
    if (!isBrowser) return;
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        // Provider setting from versions that supported OpenAI
        localStorage.removeItem('markdown-viewer-ai-provider');
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
