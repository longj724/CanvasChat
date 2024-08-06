// External Dependencies
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Handle,
  Position,
  useEdges,
  useReactFlow,
  useStoreApi,
} from '@xyflow/react';
import { LocateFixed, PlusCircle, Scroll, Trash } from 'lucide-react';

// Relative Dependencies
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatInput from './ChatInput';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateMessage } from '@/hooks/use-update-message';
import MessageText from './MessageText';
import { useSendMessage } from '@/hooks/use-send-message';

export interface MessageNodeType {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: MessageType;
}

export interface MessageType {
  userMessage: string | null;
  responseMessage: string | null;
  previousMessages: string;
  model: string;
  createdFrom: Position | null;
  toggleScrollMode: Dispatch<SetStateAction<boolean>>;
  togglePanning: Dispatch<SetStateAction<boolean>>;
}

const MessageNode = ({
  data,
  height,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
  width,
}: {
  data: MessageType;
  height: number;
  id: string;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  width: number;
}) => {
  const {
    createdFrom,
    previousMessages,
    responseMessage,
    model,
    togglePanning,
    toggleScrollMode,
    userMessage,
  } = data;

  const [userInput, setUserInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(model);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const { addNodes, addEdges, deleteElements, setCenter } = useReactFlow();
  const store = useStoreApi();
  const edges = useEdges();
  const updateMessageMutation = useUpdateMessage();
  const { sendMessage, isLoading, streamingResponse } = useSendMessage();

  const hasBottomEdge = useMemo(() => {
    return edges.some((edge) => edge.source === id);
  }, [id, edges]);

  const handleAddBottomNode = useCallback(() => {
    const newNodeId = `${id}-child-${Date.now()}`;
    // TODO: Fix height bug where height is 0 before the node is interacted with
    const nodeHeight = height === 0 ? 420 : height;
    const newNode = {
      id: newNodeId,
      position: {
        x: positionAbsoluteX,
        y: positionAbsoluteY + nodeHeight + 100,
      },
      data: {
        userMessage: null,
        responseMessage: null,
        previousMessages: [],
        createdFrom: Position.Bottom,
        togglePanning,
        toggleScrollMode,
      },
      type: 'messageNode',
    };

    const newEdge = {
      id: `${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
    };

    addNodes(newNode);
    addEdges(newEdge);
  }, [id, positionAbsoluteX, positionAbsoluteY, addNodes, addEdges]);

  const handleAddRightNode = useCallback(() => {
    const newNodeId = `${id}-child-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      position: {
        x: positionAbsoluteX + width + 200,
        y: positionAbsoluteY,
      },
      data: {
        userMessage: null,
        responseMessage: null,
        previousMessages: [],
        createdFrom: Position.Right,
        togglePanning,
        toggleScrollMode,
      },
      type: 'messageNode',
    };

    const newEdge = {
      id: `${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      sourceHandle: Position.Right,
      targetHandle: Position.Left,
    };

    addNodes(newNode);
    addEdges(newEdge);
  }, [id, positionAbsoluteX, positionAbsoluteY, addNodes, addEdges]);

  const handleDeleteNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  const handleCenterOnNode = useCallback(() => {
    setCenter(positionAbsoluteX + width / 2, positionAbsoluteY + height / 2, {
      zoom: 1,
      duration: 800,
    });
  }, [positionAbsoluteX, positionAbsoluteY, setCenter]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    updateMessageMutation.mutate({
      messageId: id,
      model: value,
    });
  };

  return (
    <>
      {/* Handles */}
      {createdFrom !== null && <Handle type="target" position={Position.Top} />}
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      <Card className="w-[600px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="test" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  value="gpt-4o"
                  // disabled={!userProfile?.user.OpenAIKeys?.key}
                  className="hover:cursor-pointer"
                >
                  gpt-4o{' '}
                  {/* {!userProfile?.user.OpenAIKeys?.key &&
                    'No OpenAI API Key Added'} */}
                </SelectItem>
                <SelectItem
                  value="gpt-4-turbo"
                  // disabled={!userProfile?.user.OpenAIKeys?.key}
                  className="hover:cursor-pointer"
                >
                  gpt-4-turbo{' '}
                  {/* {!userProfile?.user.OpenAIKeys?.key &&
                    'No OpenAI API Key Added'} */}
                </SelectItem>
                <SelectItem
                  value="gpt-4-0125-preview"
                  // disabled={!userProfile?.user.OpenAIKeys?.key}
                  className="hover:cursor-pointer"
                >
                  gpt-4-0125-preview{' '}
                  {/* {!userProfile?.user.OpenAIKeys?.key &&
                    'No OpenAI API Key Added'} */}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center ml-auto gap-2">
            <Button size={'icon'} className="ml-auto">
              <LocateFixed onClick={handleCenterOnNode} />
            </Button>
            <Button
              size={'icon'}
              className={cn(
                'ml-auto',
                !store.getState().nodesDraggable && 'bg-red-500'
              )}
            >
              <Scroll onClick={() => toggleScrollMode((prev) => !prev)} />
            </Button>
            <Button size={'icon'} className="ml-auto">
              <Trash onClick={handleDeleteNode} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userMessage && (
            <MessageText
              type="user"
              content={userMessage as string}
              togglePanning={togglePanning}
            />
          )}
          {isSendingMessage && (
            <MessageText
              type="user"
              content={userInput}
              togglePanning={togglePanning}
            />
          )}
          {streamingResponse !== null && (
            <MessageText
              type="system"
              content={streamingResponse as string}
              togglePanning={togglePanning}
            />
          )}
          {responseMessage && (
            <MessageText
              type="system"
              content={responseMessage}
              togglePanning={togglePanning}
            />
          )}
          {!userMessage && !isSendingMessage && (
            <ChatInput
              userInput={userInput}
              setUserInput={setUserInput}
              isLoading={isLoading}
              messageId={id}
              model={model}
              previousMessageContext={previousMessages}
              sendMessage={sendMessage}
              setIsSendingMessage={setIsSendingMessage}
              streamingResponse={streamingResponse}
              togglePanning={togglePanning}
            />
          )}
        </CardContent>
        <CardFooter className="flex-col">
          <Button
            disabled={!userMessage && !isSendingMessage}
            onClick={handleAddBottomNode}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Message
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default MessageNode;
