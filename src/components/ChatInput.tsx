'use client';

// External Dependencies
import { CircleStop, LoaderCircle, Paperclip, Send } from 'lucide-react';
import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import { useStoreApi } from '@xyflow/react';
import { UseMutateFunction } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

// Relative Dependencies
import { Input } from './ui/input';
import { TextareaAutosize } from './ui/textarea-autosize';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/utils';
import FileUploadedNotification from './FileUploadedNotification';
import { FileUploadData } from './customNode';

type ChatInputProps = {
  isLoading: boolean;
  messageId: string;
  model: string;
  previousMessageContext: string;
  sendMessage: UseMutateFunction<
    string,
    Error,
    {
      messageId: string;
      userMessage: string;
      model: string;
      previousMessageContext: string;
      supabaseToken: string;
      fileUrls?: string[] | undefined;
    },
    unknown
  >;
  setHasSentMessage: Dispatch<SetStateAction<boolean>>;
  setIsSendingMessage: Dispatch<SetStateAction<boolean>>;
  setUploadedFiles: Dispatch<SetStateAction<FileUploadData[]>>;
  setUserInput: Dispatch<SetStateAction<string>>;
  streamingResponse: string | null;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  uploadedFiles: FileUploadData[];
  userInput: string;
};

const ChatInput = ({
  setHasSentMessage,
  isLoading,
  messageId,
  model,
  previousMessageContext,
  sendMessage,
  setIsSendingMessage,
  setUploadedFiles,
  setUserInput,
  streamingResponse,
  togglePanning,
  uploadedFiles,
  userInput,
}: ChatInputProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

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

  const onLeave = () => {
    store.setState({
      nodesDraggable: true,
    });
    togglePanning((prev) => !prev);
  };

  const handleSendMessage = async () => {
    setIsSendingMessage(true);
    setHasSentMessage(true);
    const token = await getToken({ template: 'supabase' });
    sendMessage({
      messageId: messageId,
      userMessage: userInput,
      model: model,
      previousMessageContext:
        previousMessageContext === '' ? '{}' : previousMessageContext,
      supabaseToken: token as string,
      fileUrls: uploadedFiles.map((file) => file.publicUrl),
    });

    setIsSendingMessage(false);
    onLeave();
  };

  const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      toast.warning('Please select a file to upload');
      return;
    }

    setIsFileUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);

    const token = await getToken({ template: 'supabase' });
    formData.append('supabaseToken', token as string);

    try {
      const response = await fetch('/api/messages/image-upload', {
        method: 'POST',
        body: formData,
      });

      const { data } = await response.json();
      const fileData: FileUploadData = {
        imageId: data.imageId,
        name: file.name,
        publicUrl: data.publicUrl,
        type: file.type,
      };

      if (response.ok) {
        setUploadedFiles((prev) => [...prev, fileData]);
        toast.success('File uploaded successfully');
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      toast.error('Failed to upload file');
    }
    setIsFileUploading(false);
  };

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
          className="text-[24px] flex max-h-56 w-full resize-none rounded-md border-none bg-transparent py-2 pl-4 pr-20 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 touch-none"
          placeholder={`Send a message...`}
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyPress}
          onPaste={() => {}}
        />

        <div className="absolute bottom-[14px] right-3 ml-[2px] flex cursor-pointer flex-row gap-1 items-center justify-center">
          {isFileUploading ? (
            <LoaderCircle className="animate-spin text-muted-foreground mr-2" />
          ) : (
            <Paperclip
              className="bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
              size={32}
              onClick={() => fileInputRef.current?.click()}
            />
          )}

          {/* Hidden input to select files from device */}
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={(e) => {
              if (!e.target.files) return;
              handleUpload(e.target.files[0]);
            }}
            accept={ACCEPTED_FILE_TYPES}
          />
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
