// External Dependencies
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeDragEvent,
  useReactFlow,
} from '@xyflow/react';
import { LocateFixed, Maximize2, PlusCircle, Trash } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateMessage } from '@/hooks/use-update-message';
import MessageText from './MessageText';
import { useSendMessage } from '@/hooks/use-send-message';
import { useCreateChildMessage } from '@/hooks/use-create-child-message';
import { WithTooltip } from '@/components/ui/with-tooltip';
import { useDeleteMessage } from '@/hooks/use-delete-message';
// import { useGetOllamaModels } from '@/hooks/use-get-ollama-models';
import FileUploadedNotification from './FileUploadedNotification';
import { useGetApiKeys } from '@/hooks/use-get-api-keys';
import SystemMessageInput from './SystemMessageInput';

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
  context: string | null;
  createdFrom: Position | null;
  isSystemMessage: boolean;
  model: string;
  previousMessages: string;
  responseMessage: string | null;
  spaceId: string;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  toggleScrollMode: Dispatch<SetStateAction<boolean>>;
  userMessage: string | null;
  width: number;
}

export interface FileUploadData {
  imageId: string;
  name: string;
  publicUrl: string;
  type: string;
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
    context,
    createdFrom,
    isSystemMessage,
    model,
    previousMessages,
    responseMessage,
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
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);

  const { addNodes, addEdges, deleteElements, setCenter } = useReactFlow();
  const updateMessageMutation = useUpdateMessage();
  const { sendMessage, isLoading, streamingResponse } = useSendMessage();
  const createChildMessageMutation = useCreateChildMessage();
  const deleteMessageMutation = useDeleteMessage(spaceId);
  const { data: apiKeyData } = useGetApiKeys();

  // const ollamaModelsQuery = useGetOllamaModels();

  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  const handleAddBottomNode = async (isAddingContextNode: boolean) => {
    let previousMessagesAsArray = [];
    if (isSystemMessage) {
      const newContextMessage = {
        role: 'system',
        content: context ?? userInput,
      };
      previousMessagesAsArray =
        previousMessages === '' ? [] : JSON.parse(previousMessages);
      previousMessagesAsArray.push(newContextMessage);
    } else {
      const newUserMessage = {
        role: 'user',
        content: userMessage ?? userInput,
      };

      const newSystemMessage = {
        role: 'assistant',
        content: responseMessage === null ? streamingResponse : responseMessage,
      };

      previousMessagesAsArray =
        previousMessages === '' ? [] : JSON.parse(previousMessages);
      previousMessagesAsArray.push(newUserMessage);
      previousMessagesAsArray.push(newSystemMessage);
    }

    const newPreviousMessageContext = JSON.stringify(previousMessagesAsArray);

    const { data } = await createChildMessageMutation.mutateAsync({
      createdFrom: Position.Bottom,
      isSystemMessage: isAddingContextNode,
      model: selectedModel,
      parentMessageId: id,
      previousMessageContext: newPreviousMessageContext,
      spaceId,
      width: 1000,
      xPosition: positionAbsoluteX,
      yPosition: positionAbsoluteY + height + 100,
    });

    const { message, edge } = data;

    const newNode = {
      id: message[0].id,
      position: {
        x: positionAbsoluteX,
        y: positionAbsoluteY + height + 100,
      },
      data: {
        createdFrom: Position.Bottom,
        isSystemMessage: isAddingContextNode,
        model: selectedModel,
        previousMessages: newPreviousMessageContext,
        responseMessage: null,
        spaceId,
        togglePanning,
        toggleScrollMode,
        userMessage: null,
      },
      type: 'messageNode',
      style: {
        width: 1000,
      },
    };

    const newEdge = {
      id: edge[0].id,
      source: id,
      target: message[0].id,
    };

    addNodes(newNode);
    addEdges(newEdge);
  };

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
    deleteMessageMutation.mutate({ messageId: id });
  };

  const handleCenterOnNode = () => {
    setCenter(positionAbsoluteX + width / 2, positionAbsoluteY + height / 2, {
      zoom: height > 1500 ? 0.5 : 0.75,
      duration: 800,
    });
  };

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

      {isSystemMessage ? (
        <SystemMessageInput
          context={context}
          handleAddBottomNode={handleAddBottomNode}
          handleCenterOnNode={handleCenterOnNode}
          handleDeleteNode={handleDeleteNode}
          messageId={id}
          setUploadedFiles={setUploadedFiles}
          togglePanning={togglePanning}
          uploadedFiles={uploadedFiles}
        />
      ) : (
        <Card onDoubleClick={handleCenterOnNode}>
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
                  <SelectLabel>OpenAI</SelectLabel>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.openAI}
                    value="gpt-4o"
                  >
                    gpt-4o{' '}
                    {!apiKeyData?.apiKeys?.openAI &&
                      ' - No OpenAI API Key Added'}
                  </SelectItem>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.openAI}
                    value="gpt-4-turbo"
                  >
                    gpt-4-turbo{' '}
                    {!apiKeyData?.apiKeys?.openAI &&
                      ' - No OpenAI API Key Added'}
                  </SelectItem>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.openAI}
                    value="gpt-4o-mini"
                  >
                    gpt-4o-mini{' '}
                    {!apiKeyData?.apiKeys?.openAI &&
                      ' - No OpenAI API Key Added'}
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Groq</SelectLabel>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.groq}
                    value="llama-3.1-8b-instant"
                  >
                    llama-3.1-8b-instant{' '}
                    {!apiKeyData?.apiKeys?.groq && ' - No Groq API Key Added'}
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Anthropic</SelectLabel>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.anthropic}
                    value="claude-3-5-sonnet-20240620"
                  >
                    claude-3-5-sonnet-20240620{' '}
                    {!apiKeyData?.apiKeys?.anthropic &&
                      ' - No Anthropic API Key Added'}
                  </SelectItem>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.anthropic}
                    value="claude-3-opus-20240229"
                  >
                    claude-3-opus-20240229{' '}
                    {!apiKeyData?.apiKeys?.anthropic &&
                      ' - No Anthropic API Key Added'}
                  </SelectItem>
                  <SelectItem
                    className="hover:cursor-pointer"
                    disabled={!apiKeyData?.apiKeys?.anthropic}
                    value="claude-3-haiku-20240307"
                  >
                    claude-3-haiku-20240307{' '}
                    {!apiKeyData?.apiKeys?.anthropic &&
                      ' - No Anthropic API Key Added'}
                  </SelectItem>
                </SelectGroup>
                {/* <SelectGroup>
                  <SelectLabel>Ollama</SelectLabel>
                  {ollamaModelsQuery?.data?.map((model) => (
                    <SelectItem
                      className="hover:cursor-pointer"
                      disabled={!apiKeyData?.apiKeys?.ollamaUrl}
                      key={model.name}
                      value={model.name}
                    >
                      {model.name}
                      {!apiKeyData?.apiKeys?.ollamaUrl &&
                        ' - No Ollama Url Added'}
                    </SelectItem>
                  ))}
                </SelectGroup> */}
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
            {userMessage ? (
              <MessageText
                content={userMessage as string}
                model={selectedModel}
                togglePanning={togglePanning}
                type="user"
              />
            ) : isSendingMessage ? (
              <MessageText
                content={userInput}
                model={selectedModel}
                togglePanning={togglePanning}
                type="user"
              />
            ) : null}
            {streamingResponse !== null ? (
              <MessageText
                content={streamingResponse as string}
                model={selectedModel}
                togglePanning={togglePanning}
                type="system"
              />
            ) : responseMessage ? (
              <MessageText
                content={responseMessage}
                model={selectedModel}
                togglePanning={togglePanning}
                type="system"
              />
            ) : null}
            {isLoading && !streamingResponse && (
              <MessageText
                content="Loading..."
                isLoading
                model={selectedModel}
                togglePanning={togglePanning}
                type="system"
              />
            )}
            {!userMessage && !isSendingMessage && (
              <ChatInput
                isLoading={isLoading}
                messageId={id}
                model={selectedModel}
                previousMessageContext={previousMessages}
                sendMessage={sendMessage}
                setIsSendingMessage={setIsSendingMessage}
                setUploadedFiles={setUploadedFiles}
                setUserInput={setUserInput}
                streamingResponse={streamingResponse}
                togglePanning={togglePanning}
                userInput={userInput}
                uploadedFiles={uploadedFiles}
              />
            )}
            <div className="flex flex-row items-center gap-2 justify-end mt-2">
              {uploadedFiles.map((file) => (
                <FileUploadedNotification
                  key={file.name}
                  fileData={file}
                  messageId={id}
                  setUploadedFiles={setUploadedFiles}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-row gap-2">
            <Button
              className="w-full"
              disabled={!userMessage && !isSendingMessage}
              onClick={() => handleAddBottomNode(false)}
              size="sm"
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Message
            </Button>
            <Button
              className="w-full"
              disabled={!userMessage && !isSendingMessage}
              onClick={() => handleAddBottomNode(true)}
              size="sm"
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Context
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default MessageNode;
