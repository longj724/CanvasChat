// External Dependencies
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeDragEvent,
  useEdges,
  useReactFlow,
  useStoreApi,
} from '@xyflow/react';
import {
  LocateFixed,
  Maximize2,
  PlusCircle,
  Scroll,
  Trash,
} from 'lucide-react';
import _ from 'lodash';

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
import { useCreateChildMessage } from '@/hooks/use-create-child-message';
import { WithTooltip } from '@/components/ui/with-tooltip';
import { useDeleteMessage } from '@/hooks/use-delete-message';

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
  createdFrom: Position | null;
  model: string;
  previousMessages: string;
  responseMessage: string | null;
  spaceId: string;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  toggleScrollMode: Dispatch<SetStateAction<boolean>>;
  userMessage: string | null;
  width: number;
}

const MessageNode = ({
  data,
  height,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
}: {
  data: MessageType;
  height: number;
  id: string;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
}) => {
  const {
    createdFrom,
    previousMessages,
    responseMessage,
    model,
    spaceId,
    togglePanning,
    toggleScrollMode,
    userMessage,
    width: initialWidth,
  } = data;

  const [userInput, setUserInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(model);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [width, setWidth] = useState(initialWidth);

  const { addNodes, addEdges, deleteElements, setCenter } = useReactFlow();
  const store = useStoreApi();
  const edges = useEdges();
  const updateMessageMutation = useUpdateMessage();
  const { sendMessage, isLoading, streamingResponse } = useSendMessage();
  const createChildMessageMutation = useCreateChildMessage();
  const deleteMessageMutation = useDeleteMessage(spaceId);

  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  const hasBottomEdge = useMemo(() => {
    return edges.some((edge) => edge.source === id);
  }, [id, edges]);

  const handleAddBottomNode = useCallback(async () => {
    // TODO: Fix height bug where height is 0 before the node is interacted with
    const nodeHeight = height === 0 ? 420 : height;

    const newUserMessage = {
      role: 'user',
      content: userMessage,
    };

    const newSystemMessage = {
      role: 'system',
      content: responseMessage === null ? streamingResponse : responseMessage,
    };

    const previousMessagesAsArray =
      previousMessages === '' ? [] : JSON.parse(previousMessages);
    previousMessagesAsArray.push(newUserMessage);
    previousMessagesAsArray.push(newSystemMessage);

    const newPreviousMessageContext = JSON.stringify(previousMessagesAsArray);

    const { data } = await createChildMessageMutation.mutateAsync({
      createdFrom: Position.Bottom,
      model,
      parentMessageId: id,
      previousMessageContext: newPreviousMessageContext,
      spaceId,
      xPosition: positionAbsoluteX,
      yPosition: positionAbsoluteY + nodeHeight + 100,
    });

    const { message, edge } = data;

    const newNode = {
      id: message[0].id,
      position: {
        x: positionAbsoluteX,
        y: positionAbsoluteY + nodeHeight + 100,
      },
      data: {
        createdFrom: Position.Bottom,
        model,
        previousMessages: [],
        responseMessage: null,
        spaceId,
        togglePanning,
        toggleScrollMode,
        userMessage: null,
      },
      type: 'messageNode',
    };

    const newEdge = {
      id: edge[0].id,
      source: id,
      target: message[0].id,
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
        createdFrom: Position.Right,
        previousMessages: [],
        responseMessage: null,
        spaceId,
        togglePanning,
        toggleScrollMode,
        userMessage: null,
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
    deleteMessageMutation.mutate({ messageId: id });
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

  const onResize = (resizeDragEvent: ResizeDragEvent) => {
    setWidth((prev) => prev + resizeDragEvent.dx);
  };

  const debouncedSave = useRef(
    _.debounce((newWidth: number) => {
      updateMessageMutation.mutate({
        messageId: id,
        width: Math.max(newWidth, 420),
      });
    }, 500)
  ).current;

  useEffect(() => {
    if (width !== initialWidth) {
      debouncedSave(width);
    }
  }, [width]);

  return (
    <>
      {createdFrom !== null && <Handle type="target" position={Position.Top} />}
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      <NodeResizeControl
        className="border-none bg-transparent"
        minWidth={400}
        minHeight={420}
        position="right"
        onResize={onResize}
      >
        <div
          className="absolute top-[50%] bg-white p-2 z-[1000]"
          style={{
            right: -20,
            transform: 'translateY(-50%)',
            cursor: 'col-resize',
            border: '1px solid #999',
            borderRadius: '50%',
          }}
        >
          <Maximize2
            size={16}
            style={{
              transform: 'rotate(45deg)',
            }}
          />
        </div>
        <div
          className="absolute top-[50%] p-2 z-[1000]"
          style={{
            right: -10,
            transform: 'translateY(-50%)',
            cursor: 'col-resize',
            height: `${height}px`,
          }}
        />
      </NodeResizeControl>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Select
            value={selectedModel}
            onValueChange={handleModelChange}
            disabled={userMessage !== null || isSendingMessage}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={model} />
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
            <WithTooltip
              delayDuration={200}
              display={<p>Center On Node</p>}
              side="top"
              trigger={
                <Button size={'icon'} className="ml-auto">
                  <LocateFixed onClick={handleCenterOnNode} />
                </Button>
              }
            />
            <WithTooltip
              delayDuration={200}
              display={<p>Delete Message</p>}
              side="top"
              trigger={
                <Button size={'icon'} className="ml-auto">
                  <Trash onClick={handleDeleteNode} />
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {userMessage && (
            <MessageText
              content={userMessage as string}
              model={model}
              togglePanning={togglePanning}
              type="user"
            />
          )}
          {isSendingMessage && (
            <MessageText
              content={userInput}
              model={model}
              togglePanning={togglePanning}
              type="user"
            />
          )}
          {streamingResponse !== null && (
            <MessageText
              content={streamingResponse as string}
              model={model}
              togglePanning={togglePanning}
              type="system"
            />
          )}
          {responseMessage && (
            <MessageText
              content={responseMessage}
              model={model}
              togglePanning={togglePanning}
              type="system"
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
