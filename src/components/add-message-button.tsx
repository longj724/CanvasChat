// External Dependencies
import { Dispatch, SetStateAction, useState } from 'react';
import { LoaderCircle, PlusCircle } from 'lucide-react';
import { useReactFlow, useStoreApi } from '@xyflow/react';
import { useParams } from 'next/navigation';

// Relative Dependencies
import { Button } from './ui/button';
import { useCreateRootMessage } from '@/hooks/use-create-root-message';

type Props = {
  togglePanning: Dispatch<SetStateAction<boolean>>;
  toggleScrollMode: Dispatch<SetStateAction<boolean>>;
};

const AddMessageButton = ({ togglePanning, toggleScrollMode }: Props) => {
  const { spaceId } = useParams();
  const { addNodes } = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);

  const store = useStoreApi();
  const mutation = useCreateRootMessage();

  const {
    height,
    width,
    transform: [transformX, transformY, zoomLevel],
  } = store.getState();

  const zoomMultiplier = 1 / zoomLevel;

  // Figure out the center of the current viewport
  const centerX = -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;
  const centerY = -transformY * zoomMultiplier + (height * zoomMultiplier) / 2;

  // Add offsets for the height/width of the new node
  // (Assuming that you don't have to calculate this as well
  const nodeWidthOffset = 300 / 2;
  const nodeHeightOffset = 220 / 2;

  const onNewRootMessage = async () => {
    setIsLoading(true);
    const { data } = await mutation.mutateAsync({
      spaceId: spaceId as string,
      xPosition: centerX - nodeWidthOffset,
      yPosition: centerY - nodeHeightOffset,
    });
    // TODO: Fix type, response should not be an array
    const { message: messageList } = data;
    const message = messageList[0];

    const newNode = {
      id: message.id,
      position: {
        x: centerX - nodeWidthOffset,
        y: centerY - nodeHeightOffset,
      },
      data: {
        userMessage: null,
        responseMessage: null,
        previousMessages: '',
        createdFrom: null,
        model: 'gpt-4o',
        togglePanning,
        toggleScrollMode,
        spaceId,
      },
      type: 'messageNode',
      style: {
        // TOOD: Figure out how to calculate dynamic zIndex
        width: 750,
        zIndex: 1000,
      },
    };

    addNodes(newNode);
    setIsLoading(false);
  };

  return (
    <div className="absolute right-[50px] top-[12px] hover:cursor-pointer z-50">
      <Button onClick={onNewRootMessage}>
        {isLoading ? (
          <LoaderCircle className="size-6 animate-spin text-muted-foreground mr-2" />
        ) : (
          <PlusCircle className="h-6 w-6 mr-2" />
        )}
        Add Message
      </Button>
    </div>
  );
};

export default AddMessageButton;
