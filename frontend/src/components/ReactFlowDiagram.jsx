import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Background,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

// Custom Node for high-contrast, scalable modern styling
const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: data.color || '#1e293b',
        color: '#ffffff',
        border: `2px solid ${data.borderColor || '#38bdf8'}`,
        minWidth: '200px',
        maxWidth: '300px',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        wordWrap: 'break-word',
      }}
    >
      <Handle type="target" position={data.targetPosition || Position.Top} style={{ visibility: 'hidden' }} />
      <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}>
        {data.label}
      </div>
      <Handle type="source" position={data.sourcePosition || Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const getLayoutedElements = async (nodes, edges, options = {}) => {
  const isHorizontal = options?.direction === 'RIGHT';
  
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options?.direction || 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.spacing.nodeNode': '60',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.spacing.edgeNodeBetweenLayers': '50',
    },
    children: nodes.map((node) => ({
      ...node,
      width: node.width || 220,
      height: node.height || 60,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);
  
  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children.find((n) => n.id === node.id);
    return {
      ...node,
      position: { x: layoutedNode.x, y: layoutedNode.y },
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      style: { opacity: 1 },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const ReactFlowDiagram = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const parseAndLayout = async () => {
      try {
        setHasError(false);
        // The data passed is a raw string from the AI's markdown code block
        let parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        if (!parsedData || !parsedData.nodes || !parsedData.edges) {
          throw new Error("Invalid diagram JSON schema. Must include 'nodes' and 'edges' arrays.");
        }

        const initialNodes = parsedData.nodes.map((n) => ({
          id: n.id,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { 
            label: n.label,
            color: n.color || (parsedData.theme === 'light' ? '#f8fafc' : '#1e293b'),
            borderColor: n.borderColor || '#38bdf8'
          },
          width: n.width || 220,
          height: n.height || 60,
          style: { opacity: 0 } // hide until layout is ready
        }));

        const initialEdges = parsedData.edges.map((e, index) => ({
          id: e.id || `e${index}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label,
          type: 'smoothstep', // orthogonal with rounded corners
          animated: e.animated || false,
          style: { stroke: '#64748b', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748b',
          },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
          initialNodes, 
          initialEdges,
          { direction: parsedData.direction || 'DOWN' }
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error("Diagram parsing/layout error:", err);
        setHasError(true);
        setErrorMessage(err.message || "Failed to render diagram.");
      }
    };

    parseAndLayout();
  }, [data, setNodes, setEdges]);

  if (hasError) {
    return (
      <div style={{ margin: '20px 0', border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(255,0,0,0.05)', padding: '1rem', borderRadius: '8px' }}>
        <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ Diagram Generation Error</p>
        <pre style={{ margin: 0, color: '#ef4444', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{errorMessage}</pre>
        <pre style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  // To prevent the React Flow div from collapsing, give it a fixed minimum height.
  // Ideally, fitView automatically adjusts the zoom/pan.
  return (
    <div style={{ width: '100%', height: '500px', margin: '30px 0', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }} // Hide watermark for clean look
        nodesDraggable={false} // Disable dragging for textbook look
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
      >
        <Background color="#cbd5e1" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowDiagram;
