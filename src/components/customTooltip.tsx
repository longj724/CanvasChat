// External Dependencies
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CursorTooltipProps {
  content: string;
  isPlacingRootMessage: boolean;
}

const CursorTooltip = ({
  content,
  isPlacingRootMessage,
}: CursorTooltipProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, []);

  return (
    <div
      className={cn(
        'absolute z-50 bg-gray-800 text-white p-2 rounded shadow-lg',
        isPlacingRootMessage ? 'visible' : 'hidden'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
      }}
    >
      {content}
    </div>
  );
};

export default CursorTooltip;
