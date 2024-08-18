'use client';

// External Dependencies
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import { Scroll } from 'lucide-react';
import { useStoreApi } from '@xyflow/react';

// Relative Dependencies
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { WithTooltip } from '@/components/ui/with-tooltip';

type Props = {
  toggleScrollMode: Dispatch<SetStateAction<boolean>>;
};

const ScrollModeButton = ({ toggleScrollMode }: Props) => {
  const store = useStoreApi();

  const onToggleScrollMode = () => {
    store.setState({
      nodesDraggable: !store.getState().nodesDraggable,
    });
    toggleScrollMode((prev) => !prev);
  };

  return (
    <div className="absolute right-[12px] top-[135px] hover:cursor-pointer z-50">
      <WithTooltip
        delayDuration={200}
        display={<p>Enable Scroll Mode</p>}
        side="left"
        trigger={
          <Scroll
            size={32}
            color="white"
            onClick={onToggleScrollMode}
            className={cn(
              'ml-auto bg-gray-600 p-2 rounded-lg hover:bg-gray-700',
              !store.getState().nodesDraggable &&
                'bg-gray-700 hover:bg-gray-600'
            )}
          />
        }
      />
    </div>
  );
};

export default ScrollModeButton;
