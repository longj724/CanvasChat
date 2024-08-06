'use client';

// External Dependencies
import { CircleStop, Send } from 'lucide-react';
import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import { useStoreApi } from '@xyflow/react';
import { UseMutateFunction } from '@tanstack/react-query';

// Relative Dependencies
import { TextareaAutosize } from './ui/textarea-autosize';
import { cn } from '@/lib/utils';

type ChatInputProps = {
  messageId: string;
  model: string;
  previousMessageContext: string;
  setIsSendingMessage: Dispatch<SetStateAction<boolean>>;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  sendMessage: UseMutateFunction<
    string,
    Error,
    {
      messageId: string;
      userMessage: string;
      model: string;
      previousMessageContext: string;
    },
    unknown
  >;
  isLoading: boolean;
  streamingResponse: string | null;
  userInput: string;
  setUserInput: Dispatch<SetStateAction<string>>;
};

const ChatInput = ({
  messageId,
  model,
  previousMessageContext,
  setIsSendingMessage,
  togglePanning,
  sendMessage,
  isLoading,
  streamingResponse,
  setUserInput,
  userInput,
}: ChatInputProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (text: string) => {
    setUserInput(text);
  };

  const store = useStoreApi();

  const onClick = () => {
    chatInputRef.current?.focus();
  };

  const onEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    store.setState({
      nodesDraggable: false,
    });
    togglePanning((prev) => !prev);
  };

  const onLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    store.setState({
      nodesDraggable: true,
    });
    togglePanning((prev) => !prev);
  };

  const handleSendMessage = async () => {
    setIsSendingMessage(true);
    sendMessage({
      messageId: messageId,
      userMessage: userInput,
      model: model,
      previousMessageContext:
        previousMessageContext === '' ? '{}' : previousMessageContext,
    });

    if (isLoading) {
      return;
    }

    store.setState({
      nodesDraggable: true,
    });

    // setIsGenerating(true);
  };

  console.log('response is:', streamingResponse);

  return (
    <div
      className="nowheel mb-4 mt-auto flex w-full z-50 cursor-text"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className="relative mt-3 flex h-60 w-full rounded-xl border-2 border-input">
        <TextareaAutosize
          textareaRef={chatInputRef}
          className="text-md flex max-h-56 w-full resize-none rounded-md border-none bg-transparent py-2 pl-4 pr-20 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 touch-none"
          placeholder={`Send a message...`}
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          // onKeyDown={handleKeyPress}
          onPaste={() => {}}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />

        <div className="absolute bottom-[14px] right-3 ml-[2px] flex cursor-pointer flex-row gap-1">
          {isGenerating ? (
            <CircleStop
              className="animate-pulse rounded bg-transparent p-1 hover:bg-background"
              onClick={() => {}}
              size={30}
            />
          ) : (
            <Send
              className={cn(
                'rounded bg-primary p-1 text-secondary hover:opacity-50',
                !userInput && 'cursor-not-allowed opacity-50'
              )}
              onClick={handleSendMessage}
              size={30}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
