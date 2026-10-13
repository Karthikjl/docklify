import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value.
 * Perfect for deferring expensive operations like markdown/JSON parsing while typing.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 120ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 120) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
