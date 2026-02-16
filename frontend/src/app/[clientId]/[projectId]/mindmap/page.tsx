"use client";

/**
 * Mind Map Component for Project Conception
 * This component provides an interactive mind map for brainstorming and organizing project ideas,
 * using ReactFlow for the diagram visualization.
 */

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
} from '@xyflow/react';
import { useParams } from 'next/navigation';
import '@xyflow/react/dist/style.css';

import { PageHeader } from '@/components/ui';
import { MindmapToolbar } from './components/MindmapToolbar';
import MindmapNode from './components/MindmapNode';
import {
  fetchMindmaps,
  createMindmap,
  updateMindmap,
  saveMindmapAsTasks,
  importToGantt,
  mindmapToReactFlow,
  Mindmap,
} from '@/api/mindmapApi';

// Color palette for mindmap nodes
const NODE_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// Custom node data type
type MindmapNodeData = {
  label: string;
  color?: string;
  fontSize?: number;
  isRoot?: boolean;
  nodeType?: string;
};

// Initial nodes for the mindmap
const initialNodes: Node<MindmapNodeData>[] = [
  {
    id: 'root',
    type: 'mindmapNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Central Topic',
      color: NODE_COLORS[0],
      isRoot: true,
      fontSize: 16,
      nodeType: 'action',
    },
  },
];

// Initial edges
const initialEdges: Edge[] = [];

const MindmapInner = () => {
  const params = useParams() as { clientId?: string; projectId?: string };
  const projectId = params?.projectId ? parseInt(params.projectId, 10) : null;
  
  // Node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Mindmap state
  const [currentMindmap, setCurrentMindmap] = useState<Mindmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ nodes: Node<MindmapNodeData>[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Selection state
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Selected edges state
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  // Selected node type for new nodes
  const [selectedNodeType, setSelectedNodeType] = useState<string>('action');
  
  // ReactFlow instance
  const { fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();
  
  // Refs for save timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentNodes = getNodes() as Node<MindmapNodeData>[];
    const currentEdges = getEdges();
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: currentNodes, edges: currentEdges });
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, getNodes, getEdges]);
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Load mindmap from API
  const loadMindmap = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const mindmaps = await fetchMindmaps(projectId);
      
      if (mindmaps.length > 0) {
        // Use the first mindmap or find one by name
        const existingMindmap = mindmaps.find(m => m.name === 'Main Mindmap') || mindmaps[0];
        setCurrentMindmap(existingMindmap);
        
        const { nodes: flowNodes, edges: flowEdges } = mindmapToReactFlow(existingMindmap);
        
        // Use type assertion to fix type incompatibility
        setNodes(flowNodes as any);
        setEdges(flowEdges as any);
        
        // Save initial state to history
        setHistory([{ nodes: flowNodes as any, edges: flowEdges as any }]);
        setHistoryIndex(0);
      } else {
        // Create a new mindmap
        const newMindmap = await createMindmap(projectId, { name: 'Main Mindmap' });
        setCurrentMindmap(newMindmap);
        
        // Save initial state to history
        setHistory([{ nodes: initialNodes, edges: initialEdges }]);
        setHistoryIndex(0);
      }
    } catch (err) {
      //console.error('Failed to load mindmap:', err);
      //setError('Failed to load mindmap. Using local storage.');
      
      // Fallback to localStorage
      const savedData = localStorage.getItem(`mindmap_${projectId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setNodes(parsed.nodes || initialNodes);
          setEdges(parsed.edges || initialEdges);
          setHistory([{ nodes: parsed.nodes || initialNodes, edges: parsed.edges || initialEdges }]);
          setHistoryIndex(0);
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
        }
      } else {
        setHistory([{ nodes: initialNodes, edges: initialEdges }]);
        setHistoryIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setNodes, setEdges]);
  
  // Save mindmap as Tasks (new approach - bypasses Mindmap tables)
  const saveMindmapAsTasksFn = useCallback(async () => {
    if (!projectId) return;
    
    const nodesToSave = getNodes() as any[];
    const edgesToSave = getEdges() as any[];
    
    setIsSaving(true);
    try {
      await saveMindmapAsTasks(projectId, nodesToSave, edgesToSave);
      
      // Also save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: nodesToSave,
        edges: edgesToSave,
      }));
    } catch (err) {
      console.error('Failed to save mindmap as tasks:', err);
      // Still save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: nodesToSave,
        edges: edgesToSave,
      }));
    } finally {
      setIsSaving(false);
    }
  }, [projectId, getNodes, getEdges]);
  
  // Import mindmap nodes to Gantt chart
  const handleImportToGantt = useCallback(async () => {
    if (!projectId) return;
    
    if (!confirm('Import all nodes to Gantt chart? This will create tasks from your mindmap nodes.')) {
      return;
    }
    
    const nodesToImport = getNodes() as any[];
    const edgesToImport = getEdges() as any[];
    
    setIsSaving(true);
    try {
      const result = await importToGantt(projectId, nodesToImport, edgesToImport);
      alert(`Successfully imported ${result.tasksCreated} nodes and ${result.linksCreated} links to the Gantt chart!`);
    } catch (err) {
      console.error('Failed to import to Gantt:', err);
      alert('Failed to import nodes to Gantt chart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, getNodes, getEdges]);
  
  // Save mindmap (legacy - still saves to API)
  const saveMindmap = useCallback(async (nodesToSave?: Node<MindmapNodeData>[], edgesToSave?: Edge[]) => {
    if (!currentMindmap) return;
    
    const nodesToSaveData = (nodesToSave || getNodes()) as Node<MindmapNodeData>[];
    const edgesToSaveData = edgesToSave || getEdges();
    
    setIsSaving(true);
    try {
      await updateMindmap(currentMindmap.mindmapId!, {
        nodes: nodesToSaveData,
        edges: edgesToSaveData,
      });
      
      // Also save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: nodesToSaveData,
        edges: edgesToSaveData,
      }));
    } catch (err) {
      console.error('Failed to save mindmap:', err);
      // Still save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: nodesToSaveData,
        edges: edgesToSaveData,
      }));
    } finally {
      setIsSaving(false);
    }
  }, [currentMindmap, getNodes, getEdges, projectId]);
  
  // Auto-save with debounce
  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (currentMindmap) {
        saveMindmap();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [currentMindmap, saveMindmap]);
  
  // Load mindmap on mount
  useEffect(() => {
    if (projectId) {
      loadMindmap();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projectId, loadMindmap]);
  
  // Delete a single node (called from node delete button)
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Don't allow deleting root node
    if (nodeId === 'root') {
      alert('Cannot delete the root node');
      return;
    }
    
    saveToHistory();
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
    setSelectedNodes((prev) => prev.filter((id) => id !== nodeId));
    
    // Auto-save after deletion
    setTimeout(() => {
      autoSave();
    }, 100);
  }, [setNodes, setEdges, saveToHistory, autoSave]);
  
  // Delete selected nodes and/or edges
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    
    saveToHistory();
    
    // Delete selected nodes
    if (selectedNodes.length > 0) {
      setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target))
      );
    }
    
    // Delete selected edges
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)));
    }
    
    setSelectedNodes([]);
    setSelectedEdges([]);
    
    // Auto-save after deletion
    setTimeout(() => {
      autoSave();
    }, 100);
  }, [selectedNodes, selectedEdges, setNodes, setEdges, saveToHistory, autoSave]);
  
  // Add new node
  const handleAddNode = useCallback((type: string = selectedNodeType) => {
    saveToHistory();
    
    const currentNodes = getNodes();
    const selectedNode = currentNodes.find((n) => selectedNodes.includes(n.id));
    
    // Find a suitable position for the new node
    const baseX = selectedNode ? selectedNode.position.x + 200 : Math.random() * 400 - 200;
    const baseY = selectedNode ? selectedNode.position.y + (Math.random() * 100 - 50) : Math.random() * 400 - 200;
    
    const newNodeId = `node-${Date.now()}`;
    
    // Get color based on type
    const typeColors: Record<string, string> = {
      action: '#ef4444',
      sous_action: '#8b5cf6',
      objectif: '#ffffff',
      livrable: '#22c55e',
    };
    
    const typeLabels: Record<string, string> = {
      action: 'Action',
      sous_action: 'Sous Action',
      objectif: 'Objectif',
      livrable: 'Livrable',
    };
    
    const newNode: Node<MindmapNodeData> = {
      id: newNodeId,
      type: 'mindmapNode',
      position: { x: baseX, y: baseY },
      data: {
        label: `${typeLabels[type] || 'Node'} ${currentNodes.length}`,
        color: typeColors[type] || '#3b82f6',
        fontSize: 14,
        nodeType: type,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // If a node is selected, create a connection
    if (selectedNode) {
      const newEdge: Edge = {
        id: `edge-${selectedNode.id}-${newNodeId}`,
        source: selectedNode.id,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    
    // Clear selection
    setSelectedNodes([]);
    
    // Auto-save after adding
    setTimeout(() => {
      autoSave();
    }, 100);
  }, [getNodes, selectedNodes, selectedNodeType, setNodes, setEdges, saveToHistory, autoSave]);
  
  // Handle node click for selection
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodes((prev) => {
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      }
      return [...prev, node.id];
    });
  }, []);

  // Handle edge click for selection
  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdges((prev) => {
      if (prev.includes(edge.id)) {
        return prev.filter((id) => id !== edge.id);
      }
      return [...prev, edge.id];
    });
  }, []);

  // Get styled edges with blue color for selected edges
  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: selectedEdges.includes(edge.id)
        ? { stroke: '#3b82f6', strokeWidth: 3 }
        : { stroke: '#94a3b8', strokeWidth: 2 },
    }));
  }, [edges, selectedEdges]);

  // Handle canvas click to deselect
  const handlePaneClick = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);
  
  // Fit view
  const handleFitView = useCallback(() => {
    fitView({ duration: 300, padding: 0.2 });
  }, [fitView]);
  
  // Zoom
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);
  
  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);
  
  // Manual save
  const handleSave = useCallback(() => {
    saveMindmap();
    alert('Mindmap saved successfully!');
  }, [saveMindmap]);
  
  // Update node label on double-click
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as MindmapNodeData;
    const currentLabel = nodeData.label;
    const newLabel = prompt('Enter new label:', currentLabel);
    if (newLabel && newLabel !== currentLabel) {
      saveToHistory();
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        )
      );
      
      // Auto-save after editing
      setTimeout(() => {
        autoSave();
      }, 100);
    }
  }, [setNodes, saveToHistory, autoSave]);
  
  // Node types with delete callback
  const nodeTypes = useMemo(() => ({
    mindmapNode: (props: any) => <MindmapNode {...props} onDelete={handleDeleteNode} />,
  }), [handleDeleteNode]);
  
  // Handle connection
  const handleConnect = useCallback((connection: any) => {
    saveToHistory();
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        },
        eds
      )
    );
    
    // Auto-save after connecting
    setTimeout(() => {
      autoSave();
    }, 100);
  }, [setEdges, saveToHistory, autoSave]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          title="Mind Map"
          description="Brainstorm and organize project ideas with an interactive mind map"
        />
        <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-white text-xl">Loading mindmap...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <PageHeader
        title="Mind Map"
        description="Brainstorm and organize project ideas with an interactive mind map"
      />
      
      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden relative">
        {/* Saving indicator */}
        {isSaving && (
          <div
            style={{
              position: 'absolute',
              top: 80,
              right: 20,
              zIndex: 10,
              padding: '8px 16px',
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Saving...
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 80,
              right: 20,
              zIndex: 10,
              padding: '8px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
        
        {/* Toolbar */}
        <div style={{ position: 'absolute', top: 80, left: 20, zIndex: 10 }}>
          <MindmapToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAddNode={handleAddNode}
            onDeleteSelected={handleDeleteSelected}
            onSave={saveMindmapAsTasksFn}
            onImportToGantt={handleImportToGantt}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            hasSelection={selectedNodes.length > 0 || selectedEdges.length > 0}
            selectedNodeType={selectedNodeType}
            onNodeTypeChange={setSelectedNodeType}
          />
        </div>
        
        {/* ReactFlow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ duration: 300, padding: 0.2 }}
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodesDraggable
          nodesConnectable
          deleteKeyCode={['Delete', 'Backspace']}
          selectionKeyCode={['Shift']}
          multiSelectionKeyCode={['Control', 'Meta']}
          snapToGrid
          snapGrid={[15, 15]}
          style={{ backgroundColor: '#0f172a' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#334155"
          />
          <Controls
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'mindmapNode') {
                return (node.data as MindmapNodeData).color || '#3b82f6';
              }
              return '#64748b';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          />
        </ReactFlow>
        
        {/* Instructions panel */}
        <Panel position="bottom-right" style={{ margin: 16 }}>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            <strong style={{ color: '#e2e8f0' }}>Tips:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
              <li>Double-click a node to edit its label</li>
              <li>Click the X button to delete a node</li>
              <li>Click nodes to select (Shift+Click for multi-select)</li>
              <li>Drag from handles to connect nodes</li>
              <li>Select node type from toolbar before adding</li>
              <li>Changes auto-save after 2 seconds of inactivity</li>
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
};

const MindmapPage = () => {
  return (
    <ReactFlowProvider>
      <MindmapInner />
    </ReactFlowProvider>
  );
};

export default MindmapPage;
