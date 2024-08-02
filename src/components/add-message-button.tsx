// External Dependencies
import { Dispatch, SetStateAction } from 'react';
import { PlusCircle } from 'lucide-react';
import { useReactFlow, Position } from '@xyflow/react';
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

  const mutation = useCreateRootMessage();

  const onNewRootMessage = async () => {
    const { data } = await mutation.mutateAsync({ spaceId: spaceId as string });
    // TODO: Fix type, response should not be an array
    const { message: messageList } = data;

    const message = messageList[0];

    // TODO: need to figure out how to position the node
    const newNode = {
      id: message.id,
      position: {
        x: 500,
        y: 500,
      },
      data: {
        systemMessage: null,
        userMessage: null,
        responseMessage: null,
        pastMessages: [],
        createdFrom: null,
        togglePanning,
        toggleScrollMode,
      },
      type: 'messageNode',
    };

    addNodes(newNode);
  };

  return (
    <div className="absolute right-[50px] top-[12px] hover:cursor-pointer z-50">
      <Button onClick={onNewRootMessage}>
        <PlusCircle className="h-6 w-6 mr-2" />
        Add Message
      </Button>
    </div>
  );
};

export default AddMessageButton;
