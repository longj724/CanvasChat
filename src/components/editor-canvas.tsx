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

// Relative Dependencies
import MessageNode, { MessageNodeType } from './customNode';
import { Sidebar } from './sidebar/sidebar';
import AddMessageButton from './add-message-button';
import { useGetMessages } from '@/hooks/use-get-messages';
import { useUpdateMessage } from '@/hooks/use-update-message';
import ScrollModeButton from './scroll-mode-button';
import SpaceTextSeach from './space-text-search';
import CursorTooltip from './customTooltip';
import { useCreateRootMessage } from '@/hooks/use-create-root-message';

const initialEdges = [{ id: '1->2', source: '1', target: '2' }];

const Flow = () => {
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isEnteringText, setIsEnteringText] = useState(false);
  const [nodes, setNodes] = useState<MessageNodeType[]>([]);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isPlacingRootMessage, setIsPlacingRootMessage] = useState(false);
  const [isNewRootMessageLoading, setIsNewRootMessageLoading] = useState(false);

  const { spaceId } = useParams();
  const { addNodes, screenToFlowPosition } = useReactFlow();
  const messagesQuery = useGetMessages(spaceId as string);
  const updateMessageMutation = useUpdateMessage();
  const createRootMessageMutation = useCreateRootMessage();

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
      if (isPlacingRootMessage) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        setIsNewRootMessageLoading(true);
        const { data } = await createRootMessageMutation.mutateAsync({
          isSystemMessage: false,
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
        setIsNewRootMessageLoading(false);

        setIsPlacingRootMessage(false);
      }
    },
    [isPlacingRootMessage, nodes, addNodes, screenToFlowPosition]
  );

  return (
    <>
      <Sidebar />
      <SignedIn>
        <AddMessageButton
          isNewRootMessageLoading={isNewRootMessageLoading}
          setIsPlacingRootMessage={setIsPlacingRootMessage}
        />
        {/* <SpaceTextSeach /> */}
      </SignedIn>
      <ScrollModeButton
        toggleScrollMode={setIsScrollMode}
        isScrollMode={isScrollMode}
      />
      <CursorTooltip
        content="Place Message"
        isPlacingRootMessage={isPlacingRootMessage}
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
        panOnDrag={!isScrollMode && !isEnteringText}
        panOnScroll={isScrollMode}
        panOnScrollMode={PanOnScrollMode.Vertical}
        panOnScrollSpeed={1}
        zoomOnPinch={!isScrollMode}
        zoomOnScroll={!isScrollMode && !isEnteringText}
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

export default Flow;
