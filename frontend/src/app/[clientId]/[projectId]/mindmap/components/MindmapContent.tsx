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
import { MindmapToolbar } from './MindmapToolbar';
import MindmapNode from './MindmapNode';
import { MindmapAIModal } from './MindmapAIModal';
import {
  fetchMindmaps,
  createMindmap,
  updateMindmap,
  saveMindmapAsTasks,
  importToGantt,
  mindmapToReactFlow,
  saveAsPreProjectVersion,
  fetchMindmapByVersion,
  saveMindmapWithVersion,
  generateMindmapFromResponses,
  AIMindmapNode,
  Mindmap,
} from '@/api/mindmapApi';
import {
  fetchVersions,
  createVersion,
  deleteVersion,
  activateVersion,
  Version,
} from '@/api/ganttApi';

// Color palette for mindmap nodes
const NODE_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#96776e', // dark green
  '#698063', // brown/taupe
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
      label: 'Sujet Central',
      color: NODE_COLORS[0],
      isRoot: true,
      fontSize: 16,
      nodeType: 'action',
    },
  },
];

// Initial edges
const initialEdges: Edge[] = [];

export const MindmapInner = () => {
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
  
  // AI Mindmap modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
  // Version state
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [versionsKey, setVersionsKey] = useState(0);
  
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
  
  // Load versions from API - returns the versions array
  const loadVersions = useCallback(async (): Promise<Version[]> => {
    if (!projectId) return [];
    
    try {
      const versionsData = await fetchVersions(projectId);
      setVersions(versionsData);
      setVersionsKey(k => k + 1);
      return versionsData;
    } catch (err) {
      console.error('Failed to load versions:', err);
      return [];
    }
  }, [projectId]);
  
  // Handle version change - load mindmap for that version
  const handleVersionChange = useCallback(async (version: Version | null) => {
    setCurrentVersion(version);
    
    if (version) {
      // Try to load mindmap for this version
      try {
        const versionMindmap = await fetchMindmapByVersion(version.versionId);
        if (versionMindmap && versionMindmap.nodes && versionMindmap.nodes.length > 0) {
          setCurrentMindmap(versionMindmap);
          const { nodes: flowNodes, edges: flowEdges } = mindmapToReactFlow(versionMindmap);
          setNodes(flowNodes as any);
          setEdges(flowEdges as any);
          setHistory([{ nodes: flowNodes as any, edges: flowEdges as any }]);
          setHistoryIndex(0);
        } else {
          // No mindmap for this version, set empty (user needs to explicitly save to version)
          setCurrentMindmap(null);
          setNodes([]);
          setEdges([]);
          setHistory([{ nodes: [], edges: [] }]);
          setHistoryIndex(0);
        }
      } catch (err: any) {
        // If 404 (not found), that's expected - no mindmap for this version yet
        if (err.response?.status === 404) {
          setCurrentMindmap(null);
          setNodes([]);
          setEdges([]);
          setHistory([{ nodes: [], edges: [] }]);
          setHistoryIndex(0);
        } else {
          console.error('Failed to load mindmap for version:', err);
        }
      }
    } else {
      // Load default mindmap (no version)
      loadMindmap();
    }
  }, [projectId, loadMindmap, setNodes, setEdges]);
  
  // Handle create version
  const handleCreateVersion = useCallback(async (name: string, description?: string, sourceVersionId?: number | null) => {
    if (!projectId) return;
    
    try {
      const newVersion = await createVersion(projectId, { name, description });
      
      // loadVersions now returns the updated versions array
      const updatedVersions = await loadVersions();
      
      // Find the newly created version in the updated list
      const createdVersion = updatedVersions.find(v => v.versionId === newVersion.versionId) || newVersion;
      
      // Set as current version - this will trigger handleVersionChange
      // which will create an empty mindmap for this new version
      setCurrentVersion(createdVersion);
    } catch (err) {
      console.error('Failed to create version:', err);
      alert('Failed to create version. Please try again.');
    }
  }, [projectId, loadVersions]);
  
  // Handle delete version
  const handleDeleteVersion = useCallback(async (versionId: number) => {
    if (!projectId) return;
    try {
      await deleteVersion(projectId, versionId);
      await loadVersions();
      setVersionsKey(k => k + 1); // Force version selector to re-render
      if (currentVersion?.versionId === versionId) {
        setCurrentVersion(null);
      }
    } catch (err) {
      console.error('Failed to delete version:', err);
      alert('Failed to delete version. Please try again.');
    }
  }, [projectId, currentVersion, loadVersions]);
  
  // Handle activate version
  const handleActivateVersion = useCallback(async (versionId: number) => {
    if (!projectId) return;
    try {
      await activateVersion(projectId, versionId);
      await loadVersions();
      setVersionsKey(k => k + 1); // Force version selector to re-render
    } catch (err) {
      console.error('Failed to activate version:', err);
      alert('Failed to activate version. Please try again.');
    }
  }, [projectId, loadVersions]);
  
  // Save mindmap as Pre-project version for Gantt chart
  const saveMindmapAsTasksFn = useCallback(async () => {
    if (!projectId) return;
    
    // Get nodes and edges directly from ReactFlow state
    const nodesToSave = getNodes();
    const edgesToSave = getEdges();
    
    console.log('saveMindmapAsTasksFn - raw nodes:', nodesToSave);
    console.log('saveMindmapAsTasksFn - raw edges:', edgesToSave);
    
    // Handle ReactFlow's getNodes() which may return { nodes: [...] } or an array
    let processedNodes = nodesToSave;
    let processedEdges = edgesToSave;
    
    // Handle ReactFlow getNodes() return format
    if (nodesToSave && typeof nodesToSave === 'object') {
      if ('nodes' in nodesToSave && Array.isArray((nodesToSave as any).nodes)) {
        processedNodes = (nodesToSave as any).nodes;
      } else if (Array.isArray(nodesToSave)) {
        processedNodes = nodesToSave;
      } else {
        // Try to get fresh nodes
        const freshNodes = getNodes();
        if (Array.isArray(freshNodes)) {
          processedNodes = freshNodes;
        } else if (freshNodes && 'nodes' in freshNodes) {
          processedNodes = (freshNodes as any).nodes;
        }
      }
    }
    
    // Handle ReactFlow getEdges() return format
    if (edgesToSave && typeof edgesToSave === 'object') {
      if ('edges' in edgesToSave && Array.isArray((edgesToSave as any).edges)) {
        processedEdges = (edgesToSave as any).edges;
      } else if (Array.isArray(edgesToSave)) {
        processedEdges = edgesToSave;
      } else {
        // Try to get fresh edges
        const freshEdges = getEdges();
        if (Array.isArray(freshEdges)) {
          processedEdges = freshEdges;
        } else if (freshEdges && 'edges' in freshEdges) {
          processedEdges = (freshEdges as any).edges;
        }
      }
    }
    
    console.log('saveMindmapAsTasksFn - processed nodes count:', Array.isArray(processedNodes) ? processedNodes.length : 'not array');
    console.log('saveMindmapAsTasksFn - processed edges count:', Array.isArray(processedEdges) ? processedEdges.length : 'not array');
    
    if (!Array.isArray(processedNodes) || !Array.isArray(processedEdges)) {
      console.error('Invalid nodes or edges format:', { processedNodes, processedEdges });
      alert('Error: Unable to get mindmap data. Please refresh the page.');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving to pre-project - nodes:', processedNodes.length, 'edges:', processedEdges.length);
      const result = await saveAsPreProjectVersion(projectId, processedNodes, processedEdges);
      
      // Also save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: processedNodes,
        edges: processedEdges,
      }));
      
      alert(`Successfully saved as Pre-project version! Created ${result.tasksCreated} tasks and ${result.linksCreated} links.`);
    } catch (err) {
      console.error('Failed to save mindmap as pre-project:', err);
      // Still save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}`, JSON.stringify({
        nodes: processedNodes,
        edges: processedEdges,
      }));
      alert('Failed to save as pre-project version. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, getNodes, getEdges]);
  
  // Legacy import function - kept for reference but not used in UI
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
    
    // Get nodes and edges - handle ReactFlow's getNodes() which returns { nodes: [...] }
    let rawNodes = nodesToSave || getNodes();
    let rawEdges = edgesToSave || getEdges();
    
    // Handle ReactFlow's getNodes() which returns { nodes: [...] } instead of array
    if (rawNodes && typeof rawNodes === 'object' && 'nodes' in rawNodes) {
      rawNodes = (rawNodes as any).nodes;
    }
    if (rawEdges && typeof rawEdges === 'object' && 'edges' in rawEdges) {
      rawEdges = (rawEdges as any).edges;
    }
    
    const nodesToSaveData = rawNodes as Node<MindmapNodeData>[];
    const edgesToSaveData = rawEdges as Edge[];
    
    setIsSaving(true);
    try {
      // Normal save - only save to default mindmap (not version-specific)
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
  
  // Save to version - explicit save button for version-specific mindmap
  const saveToVersion = useCallback(async (nodesToSave?: Node<MindmapNodeData>[], edgesToSave?: Edge[]) => {
    const vid = currentVersion?.versionId;
    if (!vid) {
      console.error('No version selected');
      return;
    }
    
    // Get nodes and edges from ReactFlow
    // Note: getNodes() returns an object { nodes: [...] }, not an array!
    let rawNodes = nodesToSave || getNodes();
    let rawEdges = edgesToSave || getEdges();
    
    // Handle ReactFlow's getNodes() which returns { nodes: [...] } instead of array
    // Also handle case where rawNodes might be passed as undefined
    if (rawNodes && typeof rawNodes === 'object') {
      if ('nodes' in rawNodes && Array.isArray((rawNodes as any).nodes)) {
        rawNodes = (rawNodes as any).nodes;
      } else if (!Array.isArray(rawNodes)) {
        // Try to get nodes from getNodes() directly if not already an array
        const freshNodes = getNodes();
        if (freshNodes && typeof freshNodes === 'object' && 'nodes' in freshNodes) {
          rawNodes = (freshNodes as any).nodes;
        } else if (Array.isArray(freshNodes)) {
          rawNodes = freshNodes;
        }
      }
    }
    
    if (rawEdges && typeof rawEdges === 'object') {
      if ('edges' in rawEdges && Array.isArray((rawEdges as any).edges)) {
        rawEdges = (rawEdges as any).edges;
      }
    }
    
    // Ensure rawNodes and rawEdges are arrays
    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
      console.error('Invalid nodes or edges:', { rawNodes, rawEdges });
      alert('Error: Invalid mindmap data. Please refresh and try again.');
      return;
    }
    
    // Ensure rawNodes and rawEdges are arrays
    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
      console.error('Invalid nodes or edges:', { rawNodes, rawEdges });
      alert('Error: Invalid mindmap data. Please refresh and try again.');
      return;
    }
    
    console.log('Saving mindmap:', { nodesCount: rawNodes.length, edgesCount: rawEdges.length });
    
    // Extract clean node data
    const nodesData = rawNodes.map(node => ({
      id: node.id,
      position: { x: node.position.x, y: node.position.y },
      data: {
        label: node.data?.label || '',
        nodeType: node.data?.nodeType || 'action',
        color: node.data?.color || '#3b82f6',
        fontSize: node.data?.fontSize || 14,
        isRoot: node.data?.isRoot || false,
      },
      type: node.type || 'default',
    }));
    
    // Extract clean edge data
    const edgesData = rawEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
    }));
    
    setIsSaving(true);
    try {
      console.log('Saving to version:', { projectId, vid, nodesData: nodesData.length, edgesData: edgesData.length });
      // @ts-ignore - TypeScript issue with type narrowing
      const result = await saveMindmapWithVersion(projectId, vid, nodesData, edgesData);
      console.log('Save result:', result);
      
      // Also save to localStorage as backup
      localStorage.setItem(`mindmap_${projectId}_version_${vid}`, JSON.stringify({
        nodes: nodesData,
        edges: edgesData,
      }));
      
      alert('Saved to version successfully!');
    } catch (err: any) {
      console.error('Failed to save mindmap to version:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert('Failed to save to version. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [currentVersion, getNodes, getEdges, projectId]);
  
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
      loadVersions();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projectId, loadMindmap, loadVersions]);
  
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
    
    // Save immediately after deletion (not debounced)
    if (currentMindmap) {
      const updatedNodes = getNodes().filter((n) => n.id !== nodeId);
      const updatedEdges = getEdges().filter((e) => e.source !== nodeId && e.target !== nodeId);
      saveMindmap(updatedNodes as any, updatedEdges as any);
    }
  }, [setNodes, setEdges, saveToHistory, autoSave, currentMindmap, getNodes, getEdges, saveMindmap]);
  
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
    
    // Save immediately after deletion (not debounced)
    if (currentMindmap) {
      saveMindmap(getNodes() as any, getEdges() as any);
    }
  }, [selectedNodes, selectedEdges, setNodes, setEdges, saveToHistory, autoSave, currentMindmap, getNodes, getEdges, saveMindmap]);
  
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
      root: '#3b82f6',
      action: '#96776e',
      sous_action: '#698063',
      objectif: '#ffffff',
      livrable: '#22c55e',
    };
    
    const typeLabels: Record<string, string> = {
      root: 'Racine',
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
  
  // Handle AI mindmap generation
  const handleAIGenerate = useCallback(async () => {
    // If a version is selected, generate and save directly to version
    if (currentVersion?.versionId && projectId) {
      const vid = currentVersion.versionId;
      const pid = projectId;
      
      try {
        setIsSaving(true);
        
        // Generate mindmap from responses
        const aiResponse = await generateMindmapFromResponses(pid);
        
        // Check if there's an error in the response
        if (aiResponse && aiResponse.error) {
          alert(aiResponse.error);
          setIsSaving(false);
          return;
        }
        
        if (!aiResponse || !aiResponse.nodes || aiResponse.nodes.length === 0) {
          alert('No mindmap could be generated from the responses. Please check if there are responses to the questions.');
          setIsSaving(false);
          return;
        }
        
        console.log('AI generated mindmap:', aiResponse);
        
        // Convert AI nodes to our format (similar to MindmapAIModal)
        const typeColors: Record<string, string> = {
          root: '#3b82f6',
          action: '#96776e',
          sous_action: '#698063',
          objectif: '#ffffff',
          livrable: '#22c55e',
        };
        
        const aiNodes: AIMindmapNode[] = aiResponse.nodes || [];
        const nodeMap: Record<string, string> = {};
        const nodesData: any[] = [];
        const edgesData: any[] = [];
        
        // First pass: create nodes with positions
        let nodeIndex = 0;
        for (const aiNode of aiNodes) {
          const newId = aiNode.id || `node-${Date.now()}-${nodeIndex}`;
          nodeMap[aiNode.id] = newId;
          
          // Calculate position based on hierarchy
          let position = { x: 0, y: 0 };
          
          if (aiNode.id === 'root') {
            position = { x: 250, y: 300 };
          } else if (aiNode.parentId && nodeMap[aiNode.parentId]) {
            // Find parent node position
            const parentNode = nodesData.find(n => n.id === nodeMap[aiNode.parentId!]);
            if (parentNode) {
              const siblingCount = aiNodes.filter(n => n.parentId === aiNode.parentId).length;
              const siblingIndex = aiNodes.filter(n => n.parentId === aiNode.parentId && 
                aiNodes.indexOf(n) < aiNodes.indexOf(aiNode)).length;
              position = {
                x: (parentNode.position?.x || 0) + 200,
                y: (parentNode.position?.y || 0) + (siblingIndex * 120) - ((siblingCount - 1) * 60),
              };
            }
          }
          
          nodesData.push({
            id: newId,
            position,
            data: {
              label: aiNode.label || 'Untitled',
              color: aiNode.color || typeColors[aiNode.nodeType] || '#3b82f6',
              fontSize: 14,
              nodeType: aiNode.nodeType || 'action',
              isRoot: aiNode.id === 'root',
            },
          });
          
          nodeIndex++;
        }
        
        // Second pass: create edges
        for (const aiNode of aiNodes) {
          if (aiNode.parentId && nodeMap[aiNode.parentId]) {
            edgesData.push({
              id: `edge-${nodeMap[aiNode.parentId]}-${nodeMap[aiNode.id]}`,
              source: nodeMap[aiNode.parentId],
              target: nodeMap[aiNode.id],
            });
          }
        }
        
        console.log('Saving to version:', { projectId: pid, vid, nodesCount: nodesData.length, edgesCount: edgesData.length });
        
        // Save to version
        await saveMindmapWithVersion(pid, vid, nodesData, edgesData);
        
        // Also load into the current view
        const reactFlowNodes: Node<MindmapNodeData>[] = nodesData.map((n: any) => ({
          id: n.id,
          type: 'mindmapNode',
          position: n.position,
          data: n.data,
        }));
        
        const reactFlowEdges: Edge[] = edgesData.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: 'arrowclosed' as const },
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }));
        
        // Replace nodes and edges
        saveToHistory();
        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
        
        alert(`Mindmap generated and saved to version "${currentVersion.name}" with ${nodesData.length} nodes!`);
        
      } catch (err: any) {
        console.error('Error generating mindmap:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        alert('Erreur: ' + JSON.stringify(errorMessage));
      } finally {
        setIsSaving(false);
      }
    } else {
      // No version selected, show modal as before
      setAiModalOpen(true);
    }
  }, [currentVersion, projectId, saveMindmapWithVersion, setNodes, setEdges, saveToHistory]);
  
  // Handle importing AI-generated mindmap nodes
  const handleAIImport = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    saveToHistory();
    
    // For each Livrable (green) node, create an empty child Livrable node
    const childNodes: Node[] = [];
    const childEdges: Edge[] = [];
    
    newNodes.forEach((node: any, index: number) => {
      // Check if this node is a Livrable type (green)
      const nodeType = node.data?.nodeType || node.nodeType;
      if (nodeType === 'livrable') {
        // Create an empty child Livrable node
        const childId = `livrable-child-${node.id}-${Date.now()}`;
        const childNode: Node = {
          id: childId,
          type: 'mindmapNode',
          position: {
            x: (node.position?.x || 0) + 200,
            y: (node.position?.y || 0) + 50
          },
          data: {
            label: 'Nouveau Livrable',
            nodeType: 'livrable',
            color: '#22c55e',
            fontSize: 14,
            isRoot: false
          }
        };
        childNodes.push(childNode);
        
        // Create edge from parent to child
        childEdges.push({
          id: `edge-${node.id}-${childId}`,
          source: node.id,
          target: childId,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        });
      }
    });
    
    // Add all new nodes and edges, plus the child nodes
    setNodes((nds) => [...nds, ...(newNodes as any), ...childNodes]);
    setEdges((eds) => [...eds, ...newEdges, ...childEdges]);
    
    // Auto-save after import
    setTimeout(() => {
      autoSave();
    }, 100);
  }, [saveToHistory, setNodes, setEdges, autoSave]);
  
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

  // Get styled edges with blue color for selected edges
  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: selectedEdges.includes(edge.id)
        ? { stroke: '#3b82f6', strokeWidth: 3 }
        : { stroke: '#94a3b8', strokeWidth: 2 },
    }));
  }, [edges, selectedEdges]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader
          title="Carte Mentale"
          description="Brainstorming et organisation des idées du projet avec une carte mentale interactive"
        />
        <div className="flex-1 bg-[#edeae5] flex items-center justify-center">
          <div className="text-[#698063] text-xl">Chargement de la carte mentale...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <PageHeader
        title="Carte Mentale"
        description="Brainstorming et organisation des idées du projet avec une carte mentale interactive"
      />
      
      <div className="flex-1 bg-[#edeae5] flex flex-col overflow-hidden relative">
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
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <MindmapToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAddNode={handleAddNode}
            onDeleteSelected={handleDeleteSelected}
            onImport={saveMindmapAsTasksFn}
            onSave={() => saveMindmap(getNodes() as any, getEdges() as any)}
            onGenerateAI={handleAIGenerate}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            hasSelection={selectedNodes.length > 0 || selectedEdges.length > 0}
            selectedNodeType={selectedNodeType}
            onNodeTypeChange={setSelectedNodeType}
            versions={versions}
            currentVersion={currentVersion}
            setCurrentVersion={handleVersionChange}
            onCreateVersion={handleCreateVersion}
            onDeleteVersion={handleDeleteVersion}
            onActivateVersion={handleActivateVersion}
            onSaveToVersion={saveToVersion}
            projectId={projectId!}
            versionsKey={versionsKey}
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
          style={{ backgroundColor: '#edeae5' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#9fb39a"
          />
          <Controls
            style={{
              backgroundColor: 'rgba(105, 128, 99, 0.95)', // Dark green #698063
              borderRadius: '8px',
              border: '1px solid rgba(105, 128, 99, 0.4)',
            }}
          />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'mindmapNode') {
                return (node.data as MindmapNodeData).color || '#3b82f6';
              }
              return '#64748b';
            }}
            maskColor="rgba(237, 234, 229, 0.7)"
            style={{
              backgroundColor: 'rgba(105, 128, 99, 0.9)', // Dark green #698063
              borderRadius: '8px',
              border: '1px solid rgba(105, 128, 99, 0.4)',
            }}
          />
        </ReactFlow>
        
        {/* Instructions panel */}
        <Panel position="bottom-right" style={{ margin: 16 }}>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(105, 128, 99, 0.9)', // Dark green #698063
              borderRadius: '8px',
              border: '1px solid rgba(105, 128, 99, 0.4)',
              color: '#ffffff',
              fontSize: '12px',
            }}
          >
            <strong style={{ color: '#e2e8f0' }}>Conseils :</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
              <li>Double-cliquez sur un nœud pour modifier son label</li>
              <li>Cliquez sur le bouton X pour supprimer un nœud</li>
              <li>Cliquez sur les nœuds pour les sélectionner (Shift+Clic pour multi-sélection)</li>
              <li>Glissez depuis les poignées pour connecter les nœuds</li>
              <li>Sélectionnez le type de nœud dans la barre d'outils avant d'ajouter</li>
              <li>Les modifications sont sauvegardées automatiquement après 2 secondes d'inactivité</li>
            </ul>
          </div>
        </Panel>
        
        {/* AI Mindmap Modal */}
        {projectId && (
          <MindmapAIModal
            isOpen={aiModalOpen}
            onClose={() => setAiModalOpen(false)}
            projectId={projectId}
            onImport={handleAIImport}
          />
        )}
      </div>
    </div>
  );
};
