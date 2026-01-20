import { useState, useRef, useEffect } from 'react';

export default function ResizablePanels({ leftPanel, rightPanel }) {
    const [leftWidth, setLeftWidth] = useState(50); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Calculate percentage, constrain between 20% and 80%
        let newLeftWidth = (mouseX / containerWidth) * 100;
        newLeftWidth = Math.max(20, Math.min(80, newLeftWidth));

        setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
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
            <div
                className="flex flex-col min-h-0 h-full fade-in"
                style={{ width: `${100 - leftWidth}%` }}
            >
                {rightPanel}
            </div>
        </div>
    );
}
