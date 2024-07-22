import React, { useState, useRef, useEffect } from 'react';

interface ResizableContainerProps {
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  initialWidth = 500,
  initialHeight = 500,
  minWidth = 100,
  minHeight = 100,
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const dx = e.clientX - startPosition.x;
      const dy = e.clientY - startPosition.y;

      setDimensions((prev) => ({
        width: Math.max(prev.width + dx, minWidth),
        height: Math.max(prev.height + dy, minHeight),
      }));

      setStartPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPosition, minWidth, minHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const scale = Math.min(
    dimensions.width / initialWidth,
    dimensions.height / initialHeight
  );

  return (
    <div
      ref={containerRef}
      className="relative border border-gray-300 overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: initialWidth,
          height: initialHeight,
        }}
      >
        {children}
      </div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ResizableContainer;
