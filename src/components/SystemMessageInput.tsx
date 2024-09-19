// External Dependencies
import { useRef, useState, Dispatch, SetStateAction, useEffect } from 'react';
import {
  LoaderCircle,
  LocateFixed,
  PlusCircle,
  Save,
  Trash,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useStoreApi } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/with-tooltip';
import { ACCEPTED_FILE_TYPES } from '@/lib/utils';
import { Input } from './ui/input';
import { TextareaAutosize } from './ui/textarea-autosize';
import { cn } from '@/lib/utils';
import { FileUploadData } from './customNode';
import { useUpdateMessage } from '@/hooks/use-update-message';

type Props = {
  context: string | null;
  handleAddBottomNode: (isAddingContextNode: boolean) => void;
  handleCenterOnNode: () => void;
  handleDeleteNode: () => void;
  messageId: string;
  setUploadedFiles: Dispatch<SetStateAction<FileUploadData[]>>;
  spaceId: string;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  uploadedFiles: FileUploadData[];
};

const SystemMessageInput = ({
  context,
  handleAddBottomNode,
  handleCenterOnNode,
  handleDeleteNode,
  messageId,
  setUploadedFiles,
  spaceId,
  togglePanning,
  uploadedFiles,
}: Props) => {
  const [userInput, setUserInput] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const store = useStoreApi();
  const updateMessageMutation = useUpdateMessage();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (context) {
      setUserInput(context);
    }
  }, [context]);

  const handleSaveMessage = async () => {
    setIsSavingMessage(true);
    if (!userInput) {
      return;
    }

    await updateMessageMutation.mutateAsync(
      {
        messageId: messageId,
        context: userInput,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['messages', spaceId] });
        },
      }
    );

    setIsSavingMessage(false);
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

  const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleSaveMessage();
    }
  };

  return (
    <Card onDoubleClick={handleCenterOnNode}>
      <CardHeader className="flex flex-row items-center justify-between">
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
        {context ? (
          <div className={cn('flex w-full flex-row py-3 bg-muted/40')}>
            <p className="ml-2">{context}</p>
          </div>
        ) : (
          <div
            className="nowheel mb-4 mt-auto flex w-full z-50 cursor-text"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={() => chatInputRef.current?.focus()}
          >
            <div className="relative mt-3 flex h-60 w-full rounded-xl border-2 border-input">
              <TextareaAutosize
                textareaRef={chatInputRef}
                className="text-md flex max-h-56 w-full resize-none rounded-md border-none bg-transparent py-2 pl-4 pr-20 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 touch-none"
                placeholder={`Create context used for all following messages...`}
                onValueChange={(value: string) => setUserInput(value)}
                value={userInput}
                minRows={1}
                maxRows={18}
                onKeyDown={handleKeyPress}
                onPaste={() => {}}
              />

              <div className="absolute bottom-[14px] right-3 ml-[2px] flex cursor-pointer flex-row gap-1 items-center justify-center">
                {/* TODO: Enabled files to be saved as context */}
                {/* {isFileUploading ? (
                  <LoaderCircle className="animate-spin text-muted-foreground mr-2" />
                ) : (
                  <Paperclip
                    className="bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
                    size={32}
                    onClick={() => fileInputRef.current?.click()}
                  />
                )} */}

                {/* Hidden input to select files from device */}
                {/* <Input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    handleUpload(e.target.files[0]);
                  }}
                  accept={ACCEPTED_FILE_TYPES}
                  disabled={context !== null}
                /> */}

                {context === undefined && <p className="mr-2">Unsaved</p>}

                <WithTooltip
                  delayDuration={200}
                  display={<p>Save</p>}
                  side="top"
                  trigger={
                    isSavingMessage ? (
                      <LoaderCircle className="animate-spin text-muted-foreground mr-2" />
                    ) : (
                      <Save
                        className={cn(
                          'rounded bg-primary p-1 text-secondary hover:opacity-50',
                          (!userInput || context !== undefined) &&
                            'cursor-not-allowed opacity-50'
                        )}
                        onClick={handleSaveMessage}
                        size={30}
                      />
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-row gap-2">
        <Button
          className="w-full"
          disabled={!context && !updateMessageMutation.isPending}
          onClick={() => handleAddBottomNode(false)}
          size="sm"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Message
        </Button>
        <Button
          className="w-full"
          disabled={!context && !updateMessageMutation.isPending}
          onClick={() => handleAddBottomNode(true)}
          size="sm"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Context
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemMessageInput;
