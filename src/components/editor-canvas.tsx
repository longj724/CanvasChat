// External Dependencies
import { useCallback, useMemo, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Relative Dependencies
import MessageNode from './customNode';
import SettingsModal from './modals/settings-modal';
import { Sidebar } from './sidebar/sidebar';

const initialEdges = [{ id: '1->2', source: '1', target: '2' }];

const Flow = () => {
  const [isScrollMode, setIsScrollMode] = useState(false);

  const toggleScrollMode = useCallback(() => {
    setIsScrollMode((prev) => !prev);
  }, [isScrollMode]);

  const initialNodes = useMemo(() => {
    return [
      {
        id: '1',
        type: 'messageNode',
        position: { x: 0, y: 0 },
        data: {
          systemMessage: 'System Message',
          userMessage: 'User Message',
          responseMessage: 'Response Message',
          pastMessages: [],
          createdFrom: null,
          toggleScrollMode,
        },
      },
      {
        id: '2',
        type: 'messageNode',
        position: { x: 0, y: 500 },
        data: {
          systemMessage: 'System Message',
          userMessage: 'User Message',
          responseMessage: 'Response Message',
          pastMessages: [],
          createdFrom: Position.Top,
          toggleScrollMode,
        },
      },
    ];
  }, []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

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

  return (
    <>
      <Sidebar />
      <SettingsModal />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // @ts-ignore - not sure why it doesn't like width and height
        nodeTypes={nodeTypes}
        edgesUpdatable={!isScrollMode}
        edgesFocusable={!isScrollMode}
        nodesDraggable={!isScrollMode}
        nodesConnectable={!isScrollMode}
        nodesFocusable={!isScrollMode}
        draggable={!isScrollMode}
        panOnDrag={!isScrollMode}
        elementsSelectable={!isScrollMode}
        zoomOnScroll={!isScrollMode}
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
