import { useState, useRef, useEffect, useCallback } from 'react';

export default function ResizablePanels({ leftPanel, rightPanel }) {
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false); // ref so event listeners always read latest value

    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        let newLeftWidth = (mouseX / containerRect.width) * 100;
        newLeftWidth = Math.max(20, Math.min(80, newLeftWidth));
        setLeftWidth(newLeftWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Update cursor and userSelect based on drag state
    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, [isDragging]);

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
                className="resize-handle-container"
                onMouseDown={handleMouseDown}
            >
                <div className={`resize-handle ${isDragging ? 'dragging' : ''}`}>
                    <div className="resize-handle-line"></div>
                    <div className="resize-handle-grip">
                        <div className="grip-dot"></div>
                        <div className="grip-dot"></div>
                        <div className="grip-dot"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            {/* Overlay blocks iframe from stealing mouse events while dragging */}
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
