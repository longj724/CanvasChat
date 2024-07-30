// External Dependencies
import { useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import {
  Handle,
  Position,
  ReactFlowState,
  useEdges,
  useReactFlow,
  useStore,
  useStoreApi,
} from '@xyflow/react';
import { LocateFixed, PlusCircle, Scroll, Trash } from 'lucide-react';

// Relative Dependencies
import CustomPlusHandle from './customHandle';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInput from './ChatInput';
import { cn } from '@/lib/utils';

const selector = (state: ReactFlowState) => ({
  nodes: state.nodes,
  setNodes: state.setNodes,
  isEnteringText: state.paneDragging,
});

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface MessageNodeType {
  id: string;
  type: 'message-node';
  position: {
    x: number;
    y: number;
  };
  data: MessageType;
}

export interface MessageType {
  systemMessage: string | null;
  userMessage: string | null;
  responseMessage: string | null;
  pastMessages: Message[];
  createdFrom: Position | null;
  toggleScrollMode: () => void;
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
    pastMessages,
    responseMessage,
    systemMessage,
    togglePanning,
    toggleScrollMode,
    userMessage,
  } = data;

  const { addNodes, addEdges, deleteElements, setCenter } = useReactFlow();
  const store = useStoreApi();
  const { nodes } = useStore(selector);

  const edges = useEdges();

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
        systemMessage: null,
        userMessage: null,
        responseMessage: null,
        pastMessages: [],
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
        systemMessage: null,
        userMessage: null,
        responseMessage: null,
        pastMessages: [],
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

  return (
    <>
      {/* Handles */}
      {createdFrom !== null && <Handle type="target" position={Position.Top} />}
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      <Card className="w-[600px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-center">Chat Node </CardTitle>
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
              <Scroll onClick={toggleScrollMode} />
            </Button>
            <Button size={'icon'} className="ml-auto">
              <Trash onClick={handleDeleteNode} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* <ScrollArea className="h-[200px] w-full pr-4">
            {pastMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </ScrollArea> */}
          {/* <form
            onSubmit={(e) => {
              e.preventDefault();
              // handleSendMessage();
            }}
            className="flex w-full space-x-2"
          >
            <Input
              placeholder="Type a message..."
              // value={inputMessage}
              // onChange={(e) => setInputMessage(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form> */}
          {!userMessage && <ChatInput togglePanning={togglePanning} />}
        </CardContent>
        <CardFooter className="flex-col">
          <Button
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
