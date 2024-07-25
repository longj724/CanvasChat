import { useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
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
import { PlusCircle } from 'lucide-react';

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
}

const MessageNode = ({ data, id }: { data: MessageType; id: string }) => {
  const reactFlowInstance = useReactFlow();
  const { systemMessage, userMessage, responseMessage, pastMessages } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-lg text-center">Chat Node </CardTitle>
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
            onClick={() => {}}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Message
          </Button>
        </CardFooter>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default MessageNode;
