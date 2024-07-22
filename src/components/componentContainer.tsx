import { forwardRef, useState, useEffect } from 'react';

interface ComponentContainerProps {
  children: React.ReactNode;
  onDimensionsChange: (newDimensions: {
    width: number;
    height: number;
  }) => void;
}

const ComponentContainer = forwardRef<HTMLDivElement, ComponentContainerProps>(
  ({ children, onDimensionsChange }: ComponentContainerProps, ref) => {
    useEffect(() => {
      const handleResize = () => {
        if (ref && 'current' in ref) {
          //  @ts-ignore
          const { offsetWidth, offsetHeight } = ref.current;
          onDimensionsChange({ width: offsetWidth, height: offsetHeight });
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [ref]);

    return <div ref={ref}>{children}</div>;
  }
);

export default ComponentContainer;
