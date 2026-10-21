import { useState, useEffect, useCallback } from 'react';

/**
 * In-app "full screen" for the preview panel: the editor is hidden and the
 * preview takes its space, while the app header stays visible. Esc exits.
 */
export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!isFullscreen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen]);

    const toggle = useCallback(() => setIsFullscreen((v) => !v), []);

    return { isFullscreen, toggle };
}
