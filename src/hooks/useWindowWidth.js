import { useState, useEffect } from 'react';

/**
 * Hook to reactively track window width (SSR-safe).
 * Defaults to 1200px during SSR.
 */
export function useWindowWidth() {
    const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

    useEffect(() => {
        let rafId = null;
        const handleResize = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setWidth(window.innerWidth);
            });
        };
        window.addEventListener('resize', handleResize, { passive: true });
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return width;
}
