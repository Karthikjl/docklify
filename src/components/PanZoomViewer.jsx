'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Tooltip from './Tooltip';
import { PlusIcon, MinusIcon, FitIcon } from './Icons';

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const FIT_PADDING = 40;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Zoom `view` by `factor`, keeping the point (px, py) of the viewport fixed */
function zoomAt(view, factor, px, py) {
    const scale = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
    const k = scale / view.scale;
    return { scale, x: px - (px - view.x) * k, y: py - (py - view.y) * k };
}

/**
 * Pan & zoom viewer for an SVG of known size.
 * Mouse: drag to pan, wheel to zoom, double-click to fit.
 * Touch: drag to pan, pinch to zoom. Keyboard (when focused): + - 0 1 and arrows.
 *
 * Until the user pans or zooms, the diagram stays "fitted" and follows resizes
 * and content changes; after that their view is kept.
 */
export default function PanZoomViewer({ svg, width, height, background, label = 'Diagram', zoomRequiresModifier = false, extraControls = null }) {
    const viewportRef = useRef(null);
    const pointersRef = useRef(new Map());
    const pinchRef = useRef(null);
    const fitViewRef = useRef(null);

    const [size, setSize] = useState({ w: 0, h: 0 });
    // null = auto-fit; otherwise the user's own view
    const [userView, setUserView] = useState(null);
    const [dragging, setDragging] = useState(false);

    // Fitted view derived from the current size (no state sync needed)
    const fitScale = size.w
        ? clamp(Math.min((size.w - FIT_PADDING) / width, (size.h - FIT_PADDING) / height, 1), MIN_SCALE, MAX_SCALE)
        : 1;
    const fitView = {
        scale: fitScale,
        x: (size.w - width * fitScale) / 2,
        y: (size.h - height * fitScale) / 2,
    };
    const view = userView ?? fitView;

    useEffect(() => {
        fitViewRef.current = fitView;
    });

    // Track viewport size
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width: w, height: h } = entry.contentRect;
            setSize({ w, h });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const update = useCallback((fn) => {
        setUserView((prev) => fn(prev ?? fitViewRef.current));
    }, []);

    const zoomBy = useCallback((factor, px, py) => {
        const el = viewportRef.current;
        const cx = px ?? (el ? el.clientWidth / 2 : 0);
        const cy = py ?? (el ? el.clientHeight / 2 : 0);
        update((v) => zoomAt(v, factor, cx, cy));
    }, [update]);

    // Wheel zoom needs a non-passive listener to stop the page from scrolling
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const onWheel = (e) => {
            // Embedded in a scrolling page: plain wheel scrolls the page, Ctrl/Cmd+wheel zooms
            if (zoomRequiresModifier && !e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            const factor = Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.0015));
            zoomBy(factor, e.clientX - rect.left, e.clientY - rect.top);
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [zoomBy, zoomRequiresModifier]);

    const handlePointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        setDragging(true);
        if (pointersRef.current.size === 2) {
            const [a, b] = [...pointersRef.current.values()];
            pinchRef.current = Math.hypot(a.x - b.x, a.y - b.y);
        }
    };

    const handlePointerMove = (e) => {
        const prev = pointersRef.current.get(e.pointerId);
        if (!prev) return;
        const next = { x: e.clientX, y: e.clientY };
        pointersRef.current.set(e.pointerId, next);

        if (pointersRef.current.size === 1) {
            const dx = next.x - prev.x;
            const dy = next.y - prev.y;
            update((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
        } else if (pointersRef.current.size === 2) {
            const [a, b] = [...pointersRef.current.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchRef.current && dist > 0) {
                const rect = viewportRef.current.getBoundingClientRect();
                zoomBy(dist / pinchRef.current, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
            }
            pinchRef.current = dist;
        }
    };

    const handlePointerEnd = (e) => {
        pointersRef.current.delete(e.pointerId);
        pinchRef.current = null;
        if (pointersRef.current.size === 0) setDragging(false);
    };

    const handleKeyDown = (e) => {
        const step = 48;
        switch (e.key) {
            case '+':
            case '=':
                zoomBy(1.2);
                break;
            case '-':
            case '_':
                zoomBy(1 / 1.2);
                break;
            case '0':
                setUserView(null);
                break;
            case '1':
                update((v) => zoomAt(v, 1 / v.scale, size.w / 2, size.h / 2));
                break;
            case 'ArrowLeft':
                update((v) => ({ ...v, x: v.x + step }));
                break;
            case 'ArrowRight':
                update((v) => ({ ...v, x: v.x - step }));
                break;
            case 'ArrowUp':
                update((v) => ({ ...v, y: v.y + step }));
                break;
            case 'ArrowDown':
                update((v) => ({ ...v, y: v.y - step }));
                break;
            default:
                return;
        }
        e.preventDefault();
    };

    const percent = Math.round(view.scale * 100);

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div
                ref={viewportRef}
                role="img"
                aria-label={`${label}. Drag to pan, scroll to zoom.`}
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onDoubleClick={() => setUserView(null)}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-zinc-400 select-none"
                style={{
                    background,
                    backgroundImage: 'radial-gradient(rgba(113,113,122,0.22) 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                    cursor: dragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width,
                        height,
                        transformOrigin: '0 0',
                        transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                        pointerEvents: 'none',
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-0.5 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121215]/95 shadow-sm backdrop-blur-sm">
                <ControlButton label="Zoom out (-)" onClick={() => zoomBy(1 / 1.25)}>
                    <MinusIcon size={13} />
                </ControlButton>
                <Tooltip content="Reset to 100% (1)" position="top">
                    <button
                        type="button"
                        onClick={() => update((v) => zoomAt(v, 1 / v.scale, size.w / 2, size.h / 2))}
                        aria-label="Reset zoom to 100%"
                        className="min-w-[44px] px-1.5 h-7 text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none"
                    >
                        {percent}%
                    </button>
                </Tooltip>
                <ControlButton label="Zoom in (+)" onClick={() => zoomBy(1.25)}>
                    <PlusIcon size={13} />
                </ControlButton>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                <ControlButton label="Fit to screen (0)" onClick={() => setUserView(null)} active={userView === null}>
                    <FitIcon size={13} />
                </ControlButton>
                {extraControls}
            </div>
        </div>
    );
}

function ControlButton({ label, onClick, active = false, children }) {
    return (
        <Tooltip content={label} position="top">
            <button
                type="button"
                onClick={onClick}
                aria-label={label}
                aria-pressed={active || undefined}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors outline-none ${
                    active
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
            >
                {children}
            </button>
        </Tooltip>
    );
}
