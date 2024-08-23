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

// Relative Dependencies
import MessageNode, { MessageNodeType } from './customNode';
import SettingsModal from './modals/settings-modal';
import { Sidebar } from './sidebar/sidebar';
import AddMessageButton from './add-message-button';
import { useGetMessages } from '@/hooks/use-get-messages';
import { useUpdateMessage } from '@/hooks/use-update-message';
import ScrollModeButton from './scroll-mode-button';
import SpaceTextSeach from './space-text-search';

const initialEdges = [{ id: '1->2', source: '1', target: '2' }];

const Flow = () => {
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isEnteringText, setIsEnteringText] = useState(false);
  const [nodes, setNodes] = useState<MessageNodeType[]>([]);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const { spaceId } = useParams();
  const messagesQuery = useGetMessages(spaceId as string);
  const updateMessageMutation = useUpdateMessage();

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
          createdFrom: (message.createdFrom as Position) ?? null,
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

  const onNodeDragStop = (event: React.MouseEvent, node: Node) => {
    updateMessageMutation.mutate({
      messageId: node.id,
      xPosition: node.position.x,
      yPosition: node.position.y,
    });
  };

  return (
    <>
      <Sidebar />
      <SignedIn>
        <AddMessageButton
          togglePanning={setIsEnteringText}
          toggleScrollMode={setIsScrollMode}
        />
        {/* <SpaceTextSeach /> */}
      </SignedIn>
      <ScrollModeButton
        toggleScrollMode={setIsScrollMode}
        isScrollMode={isScrollMode}
      />
      <ReactFlow
        // @ts-ignore
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        // @ts-ignore - not sure why it doesn't like width and height
        nodeTypes={nodeTypes}
        edgesUpdatable={!isScrollMode}
        edgesFocusable={!isScrollMode}
        nodesDraggable={!isScrollMode}
        nodesConnectable={!isScrollMode}
        nodesFocusable={!isScrollMode}
        draggable={!isScrollMode && !isEnteringText}
        panOnDrag={!isScrollMode && !isEnteringText}
        // elementsSelectable={!isScrollMode}
        zoomOnScroll={!isScrollMode && !isEnteringText}
        zoomOnPinch={!isScrollMode}
        panOnScrollMode={PanOnScrollMode.Vertical}
        panOnScroll={isScrollMode}
        panOnScrollSpeed={1}
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
