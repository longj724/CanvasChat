// External Dependencies
import { useCallback, useMemo } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  useEdges,
} from '@xyflow/react';
import { PlusCircle, Trash } from 'lucide-react';

// Relative Dependencies
import CustomPlusHandle from './customHandle';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    userMessage,
  } = data;

  const reactFlowInstance = useReactFlow();
  const edges = useEdges();

  const hasBottomEdge = useMemo(() => {
    return edges.some((edge) => edge.source === id);
  }, [id, edges]);

  const handleAddBottomNode = useCallback(() => {
    const newNodeId = `${id}-child-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      position: {
        x: positionAbsoluteX,
        y: positionAbsoluteY + height + 100,
      },
      data: {
        systemMessage: null,
        userMessage: null,
        responseMessage: null,
        pastMessages: [],
        createdFrom: Position.Bottom,
      },
      type: 'messageNode',
    };

    const newEdge = {
      id: `${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
    };

    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(newEdge);
  }, [id, positionAbsoluteX, positionAbsoluteY, reactFlowInstance]);

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

    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(newEdge);
  }, [id, positionAbsoluteX, positionAbsoluteY, reactFlowInstance]);

  const handleDeleteNode = useCallback(() => {
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);

  return (
    <>
      {/* Handles */}
      {createdFrom !== null && <Handle type="target" position={Position.Top} />}
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      <Card className="w-[600px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-center">Chat Node </CardTitle>
          <Button size={'icon'} className="ml-auto">
            <Trash onClick={handleDeleteNode} />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full pr-4">
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
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <form
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
          </form>
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
