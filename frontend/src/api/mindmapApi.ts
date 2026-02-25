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
  versionId?: number | null;
  name: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
  createdAt?: string;
  updatedAt?: string;
  version?: {
    versionId: number;
    name: string;
    isActive: boolean;
  };
}

// Interface for AI generated mindmap nodes
export interface AIMindmapNode {
  id: string;
  parentId?: string | null;
  label: string;
  nodeType: string;
  color: string;
}

export interface AIMindmapResponse {
  nodes?: AIMindmapNode[];
  error?: string;
}

// API Functions

/**
 * Generate a mindmap from project responses using Mistral AI
 */
export const generateMindmapFromResponses = async (
  projectId: number
): Promise<AIMindmapResponse> => {
  const response = await axiosInstance.get(`/mistral/generateMindmapFromResponses/${projectId}`);
  return response.data;
};

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
 * Get a mindmap by version ID
 */
export const fetchMindmapByVersion = async (versionId: number): Promise<Mindmap> => {
  const response = await axiosInstance.get(`/mindmap/version/${versionId}/mindmap`);
  return response.data;
};

/**
 * Create a new mindmap
 */
export const createMindmap = async (
  projectId: number,
  data: { name?: string; versionId?: number }
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
 * Delete a mindmap
 */
export const deleteMindmap = async (mindmapId: number): Promise<void> => {
  await axiosInstance.delete(`/mindmap/mindmaps/${mindmapId}`);
};

/**
 * Save mindmap with a specific version
 */
export const saveMindmapWithVersion = async (
  projectId: number,
  versionId: number | null | undefined,
  nodes: any[],
  edges: any[]
): Promise<Mindmap> => {
  if (!versionId) {
    throw new Error('versionId is required');
  }
  
  const url = `/mindmap/project/${projectId}/version/${versionId}/save`;
  console.log('API call:', url, { nodesCount: nodes?.length, edgesCount: edges?.length });
  
  try {
    const response = await axiosInstance.post(url, {
      nodes,
      edges,
    });
    console.log('API response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    // Re-throw with more context
    if (error.response?.status === 404) {
      throw new Error('Version not found');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error: ' + (error.response?.data?.message || 'Unknown error'));
    }
    throw error;
  }
};

/**
 * Duplicate mindmap for a new version (preserves node positions)
 */
export const duplicateMindmapForVersion = async (
  sourceVersionId: number,
  targetVersionId: number
): Promise<Mindmap> => {
  const response = await axiosInstance.post(`/mindmap/version/${sourceVersionId}/duplicate-to/${targetVersionId}`);
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
