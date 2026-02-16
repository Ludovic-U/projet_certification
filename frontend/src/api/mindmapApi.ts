import axiosInstance from './axiosInstance';

// Types
export interface MindmapNode {
  nodeId?: number;
  externalId: string;
  label: string;
  nodeType: string;
  positionX: number;
  positionY: number;
  color?: string;
  fontSize: number;
  isRoot: boolean;
}

export interface MindmapEdge {
  edgeId?: number;
  externalId: string;
  source: string;
  target: string;
}

export interface Mindmap {
  mindmapId?: number;
  projectId: number;
  name: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
  createdAt?: string;
  updatedAt?: string;
}

// API Functions

/**
 * Get all mindmaps for a project
 */
export const fetchMindmaps = async (projectId: number): Promise<Mindmap[]> => {
  const response = await axiosInstance.get(`/mindmap/project/${projectId}/mindmaps`);
  return response.data;
};

/**
 * Get a single mindmap by ID
 */
export const fetchMindmap = async (mindmapId: number): Promise<Mindmap> => {
  const response = await axiosInstance.get(`/mindmap/mindmaps/${mindmapId}`);
  return response.data;
};

/**
 * Create a new mindmap
 */
export const createMindmap = async (
  projectId: number,
  data: { name?: string }
): Promise<Mindmap> => {
  const response = await axiosInstance.post(`/mindmap/project/${projectId}/mindmaps`, data);
  return response.data;
};

/**
 * Update a mindmap with all nodes and edges
 */
export const updateMindmap = async (
  mindmapId: number,
  data: {
    nodes?: any[];
    edges?: any[];
    name?: string;
  }
): Promise<Mindmap> => {
  const response = await axiosInstance.put(`/mindmap/mindmaps/${mindmapId}`, data);
  return response.data;
};

/**
 * Save mindmap nodes as Tasks (new approach - bypasses Mindmap tables)
 */
export const saveMindmapAsTasks = async (
  projectId: number,
  nodes: any[],
  edges: any[]
): Promise<{ tasksCreated: number; linksCreated: number }> => {
  const response = await axiosInstance.post(`/mindmap/project/${projectId}/save-as-tasks`, {
    nodes,
    edges,
  });
  return response.data;
};

/**
 * Import mindmap nodes to Gantt chart
 */
export const importToGantt = async (
  projectId: number,
  nodes: any[],
  edges: any[]
): Promise<{ message: string; tasksCreated: number; linksCreated: number }> => {
  const response = await axiosInstance.post(`/mindmap/project/${projectId}/import-to-gantt`, {
    nodes,
    edges,
  });
  return response.data;
};

/**
 * Save mindmap as Pre-project version for Gantt chart
 * Creates or updates a "Pre-project" version with all nodes as tasks
 */
export const saveAsPreProjectVersion = async (
  projectId: number,
  nodes: any[],
  edges: any[]
): Promise<{ message: string; versionId: number; versionName: string; tasksCreated: number; linksCreated: number }> => {
  const response = await axiosInstance.post(`/mindmap/project/${projectId}/save-as-preproject`, {
    nodes,
    edges,
  });
  return response.data;
};

/**
 * Delete a mindmap
 */
export const deleteMindmap = async (mindmapId: number): Promise<void> => {
  await axiosInstance.delete(`/mindmap/mindmaps/${mindmapId}`);
};

/**
 * Add a node to a mindmap
 */
export const addMindmapNode = async (
  mindmapId: number,
  nodeData: any
): Promise<MindmapNode> => {
  const response = await axiosInstance.post(`/mindmap/mindmaps/${mindmapId}/nodes`, nodeData);
  return response.data;
};

/**
 * Add an edge to a mindmap
 */
export const addMindmapEdge = async (
  mindmapId: number,
  edgeData: any
): Promise<MindmapEdge> => {
  const response = await axiosInstance.post(`/mindmap/mindmaps/${mindmapId}/edges`, edgeData);
  return response.data;
};

/**
 * Delete a node from a mindmap
 */
export const deleteMindmapNode = async (
  mindmapId: number,
  nodeId: string
): Promise<void> => {
  await axiosInstance.delete(`/mindmap/mindmaps/${mindmapId}/nodes/${encodeURIComponent(nodeId)}`);
};

/**
 * Delete an edge from a mindmap
 */
export const deleteMindmapEdge = async (
  mindmapId: number,
  edgeId: string
): Promise<void> => {
  await axiosInstance.delete(`/mindmap/mindmaps/${mindmapId}/edges/${encodeURIComponent(edgeId)}`);
};

/**
 * Convert backend Mindmap to ReactFlow format
 */
export const mindmapToReactFlow = (mindmap: Mindmap): {
  nodes: any[];
  edges: any[];
} => {
  const nodes = (mindmap.nodes || []).map((node) => ({
    id: node.externalId,
    type: 'mindmapNode',
    position: { x: node.positionX, y: node.positionY },
    data: {
      label: node.label,
      nodeType: node.nodeType,
      color: node.color,
      fontSize: node.fontSize,
      isRoot: node.isRoot,
    },
  }));

  const edges = (mindmap.edges || []).map((edge) => ({
    id: edge.externalId,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' as const },
  }));

  return { nodes, edges };
};
