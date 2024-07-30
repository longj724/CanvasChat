'use client';

// External Dependencies
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CircleStop, Paperclip, Send } from 'lucide-react';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { useStoreApi } from '@xyflow/react';

// Relative Dependencies
import { TextareaAutosize } from './ui/textarea-autosize';
import { cn } from '@/lib/utils';

type ChatInputProps = {
  togglePanning: Dispatch<SetStateAction<boolean>>;
};

const ChatInput = ({ togglePanning }: ChatInputProps) => {
  const router = useRouter();
  const { projectID, chatID } = useParams();
  const searchParams = useSearchParams();
  const model = searchParams.get('model');

  const [userInput, setUserInput] = useState('');
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
      // nodesFocusable: false,
    });
    togglePanning((prev) => !prev);
  };

  const onLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    store.setState({
      nodesDraggable: true,
    });
    togglePanning((prev) => !prev);
  };

  return (
    <div
      className="mb-4 mt-auto flex w-full z-50 cursor-text"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className="relative mt-3 flex h-60 w-full rounded-xl border-2 border-input">
        <>
          {/* <Paperclip
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          /> */}

          {/* Hidden input to select files from device */}
          {/* <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={(e) => {
              if (!e.target.files) return;
              handleSelectDeviceFile(e.target.files[0]);
            }}
            accept={filesToAccept}
          /> */}
        </>

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
              // onClick={handleSendMessage}
              size={30}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
