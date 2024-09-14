// External Dependencies
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  EdgeChange,
  MiniMap,
  NodeChange,
  PanOnScrollMode,
  Position,
  ReactFlow,
  useEdgesState,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';
import { useReactFlow } from '@xyflow/react';
import { LoaderCircle, SquareMousePointer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Relative Dependencies
import MessageNode, { MessageNodeType } from './customNode';
import { Sidebar } from './sidebar/sidebar';
import AddMessageButton from './add-message-button';
import AddContextMessageButton from './add-context-message-button';
import { useGetMessages } from '@/hooks/use-get-messages';
import { useUpdateMessage } from '@/hooks/use-update-message';
import ScrollModeButton from './scroll-mode-button';
import SpaceTextSeach from './space-text-search';
import CursorTooltip from './customTooltip';
import { useCreateRootMessage } from '@/hooks/use-create-root-message';

const initialEdges = [{ id: '1->2', source: '1', target: '2' }];

const MessageCanvas = () => {
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isEnteringText, setIsEnteringText] = useState(false);
  const [nodes, setNodes] = useState<MessageNodeType[]>([]);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isPlacingRootMessage, setIsPlacingRootMessage] = useState(false);
  const [isPlacingContextMessage, setIsPlacingContextMessage] = useState(false);
  const [isNewRootMessageLoading, setIsNewRootMessageLoading] = useState(false);
  const [isNewContextMessageLoading, setIsNewContextMessageLoading] =
    useState(false);

  const { spaceId } = useParams();
  const { addNodes, screenToFlowPosition, setCenter } = useReactFlow();
  const messagesQuery = useGetMessages(spaceId as string);
  const updateMessageMutation = useUpdateMessage();
  const createRootMessageMutation = useCreateRootMessage();
  const searchParams = useSearchParams();
  const position = searchParams.get('position');

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      //@ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      //@ts-ignore
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: any) => setEdges((eds: any) => addEdge(connection, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(
    () => ({
      messageNode: MessageNode,
    }),
    []
  );

  useEffect(() => {
    // Turn messages into nodes
    const nodes: MessageNodeType[] =
      messagesQuery.data?.messages.map((message) => ({
        id: message.id,
        type: 'messageNode',
        position: {
          x: Number(message.xPosition),
          y: Number(message.yPosition),
        },
        data: {
          context: message.context,
          createdFrom: (message.createdFrom as Position) ?? null,
          isSystemMessage: message.isSystemMessage ?? false,
          model: message.modelName,
          previousMessages: message.previousMessageContext ?? '',
          responseMessage: message.response,
          spaceId: message.spaceId,
          togglePanning: setIsEnteringText,
          toggleScrollMode: setIsScrollMode,
          userMessage: message.userMessage,
          width: Number(message.width),
        },
        style: {
          width: Number(message.width),
        },
      })) ?? [];

    if (messagesQuery.data) {
      setNodes(nodes);
    }

    const edges =
      messagesQuery.data?.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId as string,
        target: edge.targetId as string,
      })) ?? [];

    if (edges) {
      setEdges(edges);
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    if (position) {
      const [x, y] = position.split(',').map((num) => Number(num));
      setCenter(x, y, {
        zoom: 0.5,
        duration: 800,
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 's' || event.key === 'S') {
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          handleCommandS();
        }
      }
    };

    const handleCommandS = () => {
      setIsScrollMode((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const onNodeDragStop = (event: React.MouseEvent, node: Node) => {
    updateMessageMutation.mutate({
      messageId: node.id,
      xPosition: node.position.x,
      yPosition: node.position.y,
    });
  };

  const onPaneClick = useCallback(
    async (event: React.MouseEvent) => {
      if (isPlacingRootMessage || isPlacingContextMessage) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        if (isPlacingContextMessage) {
          setIsNewContextMessageLoading(true);
        } else {
          setIsNewRootMessageLoading(true);
        }

        const { data } = await createRootMessageMutation.mutateAsync({
          isSystemMessage: isPlacingContextMessage,
          spaceId: spaceId as string,
          width: 750,
          xPosition: position.x,
          yPosition: position.y,
        });
        // TODO: Fix type, response should not be an array
        const { message: messageList } = data;
        const message = messageList[0];

        const newNode = {
          id: message.id,
          position: {
            x: position.x,
            y: position.y,
          },
          data: {
            isSystemMessage: isPlacingContextMessage,
            userMessage: null,
            responseMessage: null,
            previousMessages: '',
            createdFrom: null,
            model: 'gpt-4o',
            togglePanning: setIsEnteringText,
            toggleScrollMode: setIsScrollMode,
            spaceId,
          },
          type: 'messageNode',
          style: {
            // TOOD: Figure out how to calculate dynamic zIndex
            width: 750,
            zIndex: 1000,
          },
        };

        addNodes(newNode);

        if (isPlacingContextMessage) {
          setIsNewContextMessageLoading(false);
          setIsPlacingContextMessage(false);
        } else {
          setIsNewRootMessageLoading(false);
          setIsPlacingRootMessage(false);
        }
      }
    },
    [
      isPlacingRootMessage,
      isPlacingContextMessage,
      nodes,
      addNodes,
      screenToFlowPosition,
    ]
  );

  return (
    <>
      <Sidebar />
      <SignedIn>
        <AddMessageButton
          isNewRootMessageLoading={isNewRootMessageLoading}
          setIsPlacingRootMessage={setIsPlacingRootMessage}
        />
        <AddContextMessageButton
          isNewContextMessageLoading={isNewContextMessageLoading}
          setIsPlacingContextMessage={setIsPlacingContextMessage}
        />
        <SpaceTextSeach />
        {spaceId === undefined && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 z-[25] h-48 bg-gray-200 flex items-center justify-center rounded-sm">
            <div className="flex flex-col items-center justify-center w-full gap-2 p-2">
              <SquareMousePointer className="h-20 w-20" color="black" />
              <h2 className="text-lg text-muted-foreground text-center">
                Create or select a space to start
              </h2>
            </div>
          </div>
        )}
        {messagesQuery.isPending && spaceId !== undefined && (
          <div className="absolute right-[50px] top-[140px] hover:cursor-pointer z-50 flex gap-2">
            <p className="text-black">Loading Messages</p>
            <LoaderCircle
              className="animate-spin text-muted-foreground"
              size={20}
            />
          </div>
        )}
      </SignedIn>
      <ScrollModeButton
        toggleScrollMode={setIsScrollMode}
        isScrollMode={isScrollMode}
      />
      <CursorTooltip
        content="Place Message"
        isPlacingRootMessage={isPlacingRootMessage || isPlacingContextMessage}
      />
      <ReactFlow
        // @ts-ignore
        nodes={nodes}
        // @ts-ignore - not sure why it doesn't like width and height
        nodeTypes={nodeTypes}
        // elementsSelectable={!isScrollMode}
        draggable={!isScrollMode && !isEnteringText}
        edges={edges}
        edgesFocusable={!isScrollMode}
        maxZoom={5}
        minZoom={0}
        nodesConnectable={!isScrollMode}
        nodesDraggable={!isScrollMode}
        nodesFocusable={!isScrollMode}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodesChange={onNodesChange}
        onPaneClick={onPaneClick}
        panOnDrag={!isScrollMode && !isEnteringText && spaceId !== undefined}
        panOnScroll={isScrollMode}
        panOnScrollMode={PanOnScrollMode.Vertical}
        panOnScrollSpeed={1}
        // zoomOnPinch={!isScrollMode}
        zoomOnScroll={!isScrollMode && !isEnteringText && spaceId !== undefined}
      >
        <Controls position="top-right" />
        <MiniMap
          position="bottom-right"
          className="!bg-background"
          zoomable
          pannable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </>
  );
};

export default MessageCanvas;
