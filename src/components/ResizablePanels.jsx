'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWindowWidth } from '../hooks/useWindowWidth';

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

    const rafRef = useRef(null);

    // ── Drag resize (desktop/tablet only) ───────────────────────
    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        const clientX = e.clientX;
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(25, Math.min(75, pct));
            setLeftWidth(pct);
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    // Touch support for resize handle on tablet
    const handleTouchMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current || !e.touches[0]) return;
        const clientX = e.touches[0].clientX;
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(25, Math.min(75, pct));
            setLeftWidth(pct);
        });
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleMouseUp);

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
            barBg: '#f4f4f5',
            barBorder: '1px solid #e4e4e7',
            activeBg: '#ffffff',
            activeShadow: '0 1px 3px rgba(0,0,0,0.06)',
            activeColor: '#09090b',
            inactiveColor: '#71717a',
        } : {
            barBg: '#121215',
            barBorder: '1px solid #27272a',
            activeBg: '#27272a',
            activeShadow: '0 1px 3px rgba(0,0,0,0.3)',
            activeColor: '#f4f4f5',
            inactiveColor: '#71717a',
        };

        return (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                {/* Minimal Tab switcher */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px',
                    margin: '8px 12px 6px',
                    borderRadius: '8px',
                    background: tabTokens.barBg,
                    border: tabTokens.barBorder,
                    flexShrink: 0,
                }}>
                    {[
                        { id: 'editor', label: 'Editor' },
                        { id: 'preview', label: 'Preview' },
                    ].map(({ id, label }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                style={{
                                    flex: 1,
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: isActive ? tabTokens.activeBg : 'transparent',
                                    boxShadow: isActive ? tabTokens.activeShadow : 'none',
                                    color: isActive ? tabTokens.activeColor : tabTokens.inactiveColor,
                                    fontSize: '0.8125rem',
                                    fontWeight: isActive ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    outline: 'none',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Active panel */}
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
                className="flex flex-col min-h-0 h-full"
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
                </div>
            </div>

            {/* Right Panel */}
            <div
                className="flex flex-col min-h-0 h-full relative"
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
