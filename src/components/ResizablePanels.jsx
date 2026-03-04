import { useState, useRef, useEffect, useCallback } from 'react';

// Custom hook to read viewport width reactively
function useWindowWidth() {
    const [width, setWidth] = useState(() => window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
}

export default function ResizablePanels({ leftPanel, rightPanel, theme = 'dark' }) {
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // mobile only
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const windowWidth = useWindowWidth();

    const isMobile = windowWidth < 768;
    const isLight = theme === 'light';
    const resizeHandleRef = useRef(null); // for non-passive touchstart

    // ── Drag resize (desktop/tablet only) ───────────────────────
    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(25, Math.min(75, pct));
        setLeftWidth(pct);
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
    }, []);

    // Touch support for resize handle on tablet
    const handleTouchMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        pct = Math.max(25, Math.min(75, pct));
        setLeftWidth(pct);
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleMouseUp);

        // Resize handle touchstart must be non-passive (calls preventDefault to stop scroll during drag)
        // Cannot use inline JSX onTouchStart for this — must wire via useEffect
        const handleTouchStart = (e) => {
            e.preventDefault();
            isDraggingRef.current = true;
            setIsDragging(true);
        };
        const el = resizeHandleRef.current;
        if (el) el.addEventListener('touchstart', handleTouchStart, { passive: false });

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
            if (el) el.removeEventListener('touchstart', handleTouchStart);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove]);

    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, [isDragging]);

    // ── Mobile layout: stacked panels with tab bar ───────────────
    if (isMobile) {
        const tabTokens = isLight ? {
            barBg: 'rgba(224,231,255,0.65)',
            barBorder: '1px solid rgba(99,102,241,0.2)',
            barShadow: '0 2px 12px rgba(99,102,241,0.1)',
            activeBg: 'rgba(255,255,255,0.97)',
            activeShadow: '0 2px 10px rgba(99,102,241,0.22), 0 0 0 1px rgba(99,102,241,0.18)',
            activeColor: '#4338ca',
            inactiveColor: '#64748b',
        } : {
            barBg: 'rgba(255,255,255,0.06)',
            barBorder: '1px solid rgba(255,255,255,0.1)',
            barShadow: '0 2px 14px rgba(0,0,0,0.3)',
            activeBg: 'rgba(255,255,255,0.14)',
            activeShadow: '0 2px 10px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.4), 0 0 14px rgba(99,102,241,0.2)',
            activeColor: '#a5b4fc',
            inactiveColor: 'rgba(148,163,184,0.7)',
        };

        return (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                {/* Tab switcher */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '5px',
                    margin: '8px 12px 6px',
                    borderRadius: '12px',
                    background: tabTokens.barBg,
                    border: tabTokens.barBorder,
                    boxShadow: tabTokens.barShadow,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    flexShrink: 0,
                }}>
                    {[
                        { id: 'editor', label: '📝 Editor' },
                        { id: 'preview', label: '👁️ Preview' },
                    ].map(({ id, label }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '9px',
                                    border: 'none',
                                    background: isActive ? tabTokens.activeBg : 'transparent',
                                    boxShadow: isActive ? tabTokens.activeShadow : 'none',
                                    color: isActive ? tabTokens.activeColor : tabTokens.inactiveColor,
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.22s cubic-bezier(0.34,1.2,0.64,1)',
                                    textShadow: isActive && !isLight
                                        ? '0 0 10px rgba(139,148,252,0.6)'
                                        : 'none',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Active panel (full remaining height) */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                    <div style={{ display: activeTab === 'editor' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                        {leftPanel}
                    </div>
                    <div style={{ display: activeTab === 'preview' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                        {rightPanel}
                    </div>
                </div>
            </div>
        );
    }

    // ── Desktop / Tablet: side-by-side with drag handle ──────────
    return (
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative h-full">
            {/* Left Panel */}
            <div
                className="flex flex-col min-h-0 h-full fade-in"
                style={{ width: `${leftWidth}%` }}
            >
                {leftPanel}
            </div>

            {/* Resize Handle */}
            <div
                ref={resizeHandleRef}
                className="resize-handle-container"
                onMouseDown={handleMouseDown}
            >
                <div className={`resize-handle ${isDragging ? 'dragging' : ''}`}>
                    <div className="resize-handle-line" />
                    <div className="resize-handle-grip">
                        <div className="grip-dot" />
                        <div className="grip-dot" />
                        <div className="grip-dot" />
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div
                className="flex flex-col min-h-0 h-full fade-in relative"
                style={{ width: `${100 - leftWidth}%` }}
            >
                {isDragging && (
                    <div className="absolute inset-0 z-50" style={{ cursor: 'col-resize' }} />
                )}
                {rightPanel}
            </div>
        </div>
    );
}

