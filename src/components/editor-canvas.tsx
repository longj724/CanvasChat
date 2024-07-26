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
  Position,
  ReactFlow,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Relative Dependencies
import MessageNode from './customNode';

const initialNodes = [
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
    },
  },
  {
    id: '2',
    type: 'messageNode',
    position: { x: 100, y: 100 },
    data: {
      systemMessage: 'System Message',
      userMessage: 'User Message',
      responseMessage: 'Response Message',
      pastMessages: [],
      createdFrom: Position.Top,
    },
  },
];

const initialEdges = [{ id: '1->2', source: '1', target: '2' }];

function Flow() {
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
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // @ts-ignore - not sure why it doesn't like width and height
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls position="top-right" />
      <MiniMap
        position="bottom-left"
        className="!bg-background"
        zoomable
        pannable
      />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
}

export default Flow;
