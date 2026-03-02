const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Node types that should be stored as descriptions on parent tasks
 * Only "objectif" - "livrable" is handled as actual Deliverables
 */
const DESCRIPTION_NODE_TYPES = ['objectif'];

/**
 * Map nodeType from mindmap to task type
 * objectif and livrable are handled specially
 * root type is mapped to 'root' for distinct display in Gantt
 * Case-insensitive check
 */
const mapNodeTypeToTaskType = (nodeType) => {
  const normalizedType = nodeType?.toLowerCase();
  const mapping = {
    'action': 'task',
    'sous_action': 'task',
    'root': 'root',
  };
  return mapping[normalizedType] || 'task';
};

/**
 * Check if a node type should be stored as description
 * Case-insensitive check to handle potential case mismatches
 */
const isDescriptionNodeType = (nodeType) => {
  return DESCRIPTION_NODE_TYPES.includes(nodeType?.toLowerCase());
};

/**
 * Check if a node type should be stored as livrable (deliverable)
 * Green nodes in the UI have nodeType 'livrable' - they are displayed with green color
 * Case-insensitive check to handle potential case mismatches
 */
const isLivrableNodeType = (nodeType) => {
  return nodeType?.toLowerCase() === 'livrable';
};

/**
 * Helper: Get existing task ID by node ID from details
 */
const getExistingTaskIdByNodeId = async (projectId, nodeId) => {
  const task = await prisma.task.findFirst({
    where: {
      projectId,
      details: {
        contains: `"nodeId":"${nodeId}"`,
      },
    },
  });
  return task?.taskId || null;
};

/**
 * Process nodes and edges to create a map of description items for each parent
 * Returns a map: parentNodeId -> array of description texts (only objectifs)
 */
const buildDescriptionMap = (nodes, edges) => {
  const parentToDescriptions = {};

  // Only process objectif nodes for descriptions
  for (const node of nodes) {
    if (!isDescriptionNodeType(node.data?.nodeType)) {
      continue;
    }

    // Find the parent node (the source of the edge pointing to this node)
    const parentEdge = edges.find(e => e.target === node.id);
    if (!parentEdge) {
      continue;
    }

    const parentNodeId = parentEdge.source;
    if (!parentToDescriptions[parentNodeId]) {
      parentToDescriptions[parentNodeId] = [];
    }

    const nodeType = node.data?.nodeType;
    const label = node.data?.label || 'Untitled';
    parentToDescriptions[parentNodeId].push(`[${nodeType.toUpperCase()}] ${label}`);
  }

  return parentToDescriptions;
};

/**
 * Process nodes and edges to create livrables and map them to parent tasks
 * Uses TaskDeliverableStatus model (not Deliverable) since it links directly to Tasks
 * Returns a map: parentNodeId -> array of livrable names (strings)
 * Also handles nodes with green color (treated as deliverables)
 */
const buildLivrableMap = async (projectId, nodes, edges) => {
  const parentToLivrables = {};

  // Process livrable nodes AND green-colored nodes
  for (const node of nodes) {
    // Check nodeType for livrable status (case-insensitive)
    if (!isLivrableNodeType(node.data?.nodeType)) {
      continue;
    }

    // Find the parent node (the source of the edge pointing to this node)
    const parentEdge = edges.find(e => e.target === node.id);
    if (!parentEdge) {
      continue;
    }

    const parentNodeId = parentEdge.source;
    if (!parentToLivrables[parentNodeId]) {
      parentToLivrables[parentNodeId] = [];
    }

    const label = node.data?.label || 'Untitled';

    // Store the livrable name - we'll create TaskDeliverableStatus after tasks are created
    parentToLivrables[parentNodeId].push(label);
  }

  return parentToLivrables;
};

/**
 * Save mindmap nodes as Tasks - Upsert approach (update if exists, create if not)
 * @param {number} projectId - The project ID
 * @param {Array} nodes - Array of mindmap nodes
 * @param {Array} edges - Array of mindmap edges
 * @param {number|null} versionId - Optional version ID to associate tasks with
 */
const saveMindmapAsTasks = async (projectId, nodes, edges, versionId = null) => {
  const createdTasks = [];
  const nodeIdToTaskId = {};

  // Build map of parent node ID -> description texts (only objectifs)
  const parentToDescriptions = buildDescriptionMap(nodes, edges);

  // Build map of parent node ID -> livrable names
  const parentToLivrables = await buildLivrableMap(projectId, nodes, edges);

  // Get all existing mindmap tasks for this project (optionally filtered by version)
  const existingTasksQuery = {
    where: {
      projectId,
      details: {
        contains: '"mindmapId":0',
      },
    },
  };
  
  // If versionId is provided, only get tasks from that version
  if (versionId) {
    existingTasksQuery.where.versionId = versionId;
  }
  
  const existingTasks = await prisma.task.findMany(existingTasksQuery);

  // Build map of nodeId -> existing taskId
  const existingNodeIdToTaskId = {};
  for (const task of existingTasks) {
    try {
      const details = JSON.parse(task.details || '{}');
      if (details.nodeId) {
        existingNodeIdToTaskId[details.nodeId] = task.taskId;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // First pass: Process regular nodes (action, sous_action, root)
  // Note: root nodes are not imported to Gantt - they only exist in the mindmap
  for (const node of nodes) {
    // Skip description and livrable nodes - they are stored differently
    if (isDescriptionNodeType(node.data?.nodeType) || isLivrableNodeType(node.data?.nodeType)) {
      continue;
    }

    // Skip root nodes - they should not be imported to Gantt
    if (node.data?.nodeType === 'root' || node.data?.isRoot === true) {
      continue;
    }

    const existingTaskId = existingNodeIdToTaskId[node.id];
    
    // Build description from objectifs attached to this node
    const descriptionTexts = parentToDescriptions[node.id] || [];
    const newDescription = descriptionTexts.join('\n');

    // Get livrable names for this task (stored as strings)
    const livrableNames = parentToLivrables[node.id] || [];

    const taskData = {
      projectId,
      name: node.data?.label || 'Untitled',
      type: mapNodeTypeToTaskType(node.data?.nodeType || 'action'),
      color: node.data?.color || '#3b82f6',
      description: newDescription || undefined, // Only set if there's a description
      // Note: details field is kept empty for user input - node metadata not stored here
    };

    // Add versionId if provided
    if (versionId) {
      taskData.versionId = versionId;
    }

    let task;
    if (existingTaskId) {
      // Update existing task, preserving description if no new one
      const oldTask = await prisma.task.findUnique({ where: { taskId: existingTaskId } });
      if (!newDescription && oldTask?.description) {
        taskData.description = oldTask.description;
      }
      
      // Update task
      task = await prisma.task.update({
        where: { taskId: existingTaskId },
        data: taskData,
      });
      
      // Create TaskDeliverableStatus for this task (instead of taskDeliverable junction table)
      for (const livrableName of livrableNames) {
        await prisma.taskDeliverableStatus.create({
          data: {
            taskId: task.taskId,
            name: livrableName,
            status: 'pending',
          },
        });
      }
    } else {
      // Create new task
      task = await prisma.task.create({
        data: taskData,
      });
      
      // Create TaskDeliverableStatus for this task
      for (const livrableName of livrableNames) {
        await prisma.taskDeliverableStatus.create({
          data: {
            taskId: task.taskId,
            name: livrableName,
            status: 'pending',
          },
        });
      }
    }

    createdTasks.push(task);
    nodeIdToTaskId[node.id] = task.taskId;
  }

  // Reset parent relationships - will be set below
  for (const nodeId of Object.keys(existingNodeIdToTaskId)) {
    const taskId = existingNodeIdToTaskId[nodeId];
    const node = nodes.find(n => n.id === nodeId);
    if (node && !isDescriptionNodeType(node?.data?.nodeType) && !isLivrableNodeType(node?.data?.nodeType)) {
      await prisma.task.update({
        where: { taskId },
        data: { parentId: null },
      });
    }
  }

  // Set parent-child relationships based on edges
  // Only for regular nodes (not objectif/livrable)
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    // Skip if either node is a description or livrable type
    if (isDescriptionNodeType(sourceNode?.data?.nodeType) || 
        isLivrableNodeType(sourceNode?.data?.nodeType) ||
        isDescriptionNodeType(targetNode?.data?.nodeType) ||
        isLivrableNodeType(targetNode?.data?.nodeType)) {
      continue;
    }

    const sourceTaskId = nodeIdToTaskId[edge.source];
    const targetTaskId = nodeIdToTaskId[edge.target];

    if (sourceTaskId && targetTaskId) {
      await prisma.task.update({
        where: { taskId: targetTaskId },
        data: { parentId: sourceTaskId },
      });
    }
  }

  // Delete any orphaned description/livrable nodes that were previously created
  // Also clean up tasks that were green-colored (now treated as deliverables)
  for (const task of existingTasks) {
    try {
      const details = JSON.parse(task.details || '{}');
      // Check if it's a description/livrable node type
      if (isDescriptionNodeType(details.nodeType) || isLivrableNodeType(details.nodeType)) {
        // Delete this task
        await prisma.task.delete({ where: { taskId: task.taskId } });
      }
    } catch (e) {
      // Ignore
    }
  }

  return {
    tasks: createdTasks,
    nodeIdToTaskId,
  };
};

/**
 * Import mindmap nodes as Tasks - Fresh import approach
 * Deletes all existing mindmap tasks first, then creates new ones
 * objectif nodes are stored as descriptions, livrable nodes as TaskDeliverableStatus
 */
const importMindmapAsTasks = async (projectId, nodes, edges) => {
  // First, delete all existing mindmap tasks for this project
  await prisma.task.deleteMany({
    where: {
      projectId,
      details: {
        contains: '"mindmapId":0',
      },
    },
  });

  const createdTasks = [];
  const nodeIdToTaskId = {};

  // Build map of parent node ID -> description texts (only objectifs)
  const parentToDescriptions = buildDescriptionMap(nodes, edges);

  // Build map of parent node ID -> livrable names
  const parentToLivrables = await buildLivrableMap(projectId, nodes, edges);

  // Create regular tasks (action, sous_action, root)
  // Note: root nodes are not imported to Gantt - they only exist in the mindmap
  for (const node of nodes) {
    // Skip description and livrable nodes - they are stored differently
    if (isDescriptionNodeType(node.data?.nodeType) || isLivrableNodeType(node.data?.nodeType)) {
      continue;
    }

    // Skip root nodes - they should not be imported to Gantt
    if (node.data?.nodeType === 'root' || node.data?.isRoot === true) {
      continue;
    }

    // Build description from objectifs attached to this node
    const descriptionTexts = parentToDescriptions[node.id] || [];
    const newDescription = descriptionTexts.join('\n');

    // Get livrable names for this task (stored as strings)
    const livrableNames = parentToLivrables[node.id] || [];

    const task = await prisma.task.create({
      data: {
        projectId,
        name: node.data?.label || 'Untitled',
        type: mapNodeTypeToTaskType(node.data?.nodeType || 'action'),
        color: node.data?.color || '#3b82f6',
        description: newDescription || undefined,
        // Note: details field is kept empty for user input - node metadata not stored here
      }
    });

    // Link livrables to task via TaskDeliverableStatus
    for (const livrableName of livrableNames) {
      await prisma.taskDeliverableStatus.create({
        data: {
          taskId: task.taskId,
          name: livrableName,
          status: 'pending',
        },
      });
    }

    createdTasks.push(task);
    nodeIdToTaskId[node.id] = task.taskId;
  }

  // Set parent-child relationships for regular nodes
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    // Skip if either node is a description or livrable type
    if (isDescriptionNodeType(sourceNode?.data?.nodeType) || 
        isLivrableNodeType(sourceNode?.data?.nodeType) ||
        isDescriptionNodeType(targetNode?.data?.nodeType) ||
        isLivrableNodeType(targetNode?.data?.nodeType)) {
      continue;
    }

    const sourceTaskId = nodeIdToTaskId[edge.source];
    const targetTaskId = nodeIdToTaskId[edge.target];

    if (sourceTaskId && targetTaskId) {
      await prisma.task.update({
        where: { taskId: targetTaskId },
        data: { parentId: sourceTaskId },
      });
    }
  }

  return {
    tasks: createdTasks,
    nodeIdToTaskId,
  };
};

/**
 * Get all mindmaps for a project
 * @param {number} projectId - The project ID
 * @returns {Promise<Array>} List of mindmaps
 */
const getMindmapsForProject = async (projectId) => {
  try {
    const mindmaps = await prisma.mindmap.findMany({
      where: { projectId },
      include: {
        nodes: true,
        edges: true,
        version: {
          select: {
            versionId: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return mindmaps.map(m => ({
      mindmapId: m.mindmapId,
      projectId: m.projectId,
      versionId: m.versionId,
      name: m.name,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      nodes: m.nodes.map(n => ({
        nodeId: n.nodeId,
        externalId: n.externalId,
        label: n.label,
        nodeType: n.nodeType,
        positionX: n.positionX,
        positionY: n.positionY,
        color: n.color,
        fontSize: n.fontSize,
        isRoot: n.isRoot
      })),
      edges: m.edges.map(e => ({
        edgeId: e.edgeId,
        externalId: e.externalId,
        source: e.source,
        target: e.target
      })),
      version: m.version
    }));
  } catch (error) {
    console.error('Error fetching mindmaps:', error);
    throw error;
  }
};

/**
 * Get a single mindmap by ID
 * @param {number} mindmapId - The mindmap ID
 * @returns {Promise<Object>} Mindmap object with nodes and edges
 */
const getMindmapById = async (mindmapId) => {
  try {
    const mindmap = await prisma.mindmap.findUnique({
      where: { mindmapId },
      include: {
        nodes: true,
        edges: true,
        version: {
          select: {
            versionId: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (!mindmap) {
      return null;
    }

    return {
      mindmapId: mindmap.mindmapId,
      projectId: mindmap.projectId,
      versionId: mindmap.versionId,
      name: mindmap.name,
      createdAt: mindmap.createdAt,
      updatedAt: mindmap.updatedAt,
      nodes: mindmap.nodes.map(n => ({
        nodeId: n.nodeId,
        externalId: n.externalId,
        label: n.label,
        nodeType: n.nodeType,
        positionX: n.positionX,
        positionY: n.positionY,
        color: n.color,
        fontSize: n.fontSize,
        isRoot: n.isRoot
      })),
      edges: mindmap.edges.map(e => ({
        edgeId: e.edgeId,
        externalId: e.externalId,
        source: e.source,
        target: e.target
      })),
      version: mindmap.version
    };
  } catch (error) {
    console.error('Error fetching mindmap:', error);
    throw error;
  }
};

/**
 * Get a mindmap by version ID
 * @param {number} versionId - The version ID
 * @returns {Promise<Object|null>} Mindmap object or null
 */
const getMindmapByVersion = async (versionId) => {
  try {
    const mindmap = await prisma.mindmap.findFirst({
      where: { versionId },
      include: {
        nodes: true,
        edges: true,
        version: {
          select: {
            versionId: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (!mindmap) {
      return null;
    }

    return {
      mindmapId: mindmap.mindmapId,
      projectId: mindmap.projectId,
      versionId: mindmap.versionId,
      name: mindmap.name,
      createdAt: mindmap.createdAt,
      updatedAt: mindmap.updatedAt,
      nodes: mindmap.nodes.map(n => ({
        nodeId: n.nodeId,
        externalId: n.externalId,
        label: n.label,
        nodeType: n.nodeType,
        positionX: n.positionX,
        positionY: n.positionY,
        color: n.color,
        fontSize: n.fontSize,
        isRoot: n.isRoot
      })),
      edges: mindmap.edges.map(e => ({
        edgeId: e.edgeId,
        externalId: e.externalId,
        source: e.source,
        target: e.target
      })),
      version: mindmap.version
    };
  } catch (error) {
    console.error('Error fetching mindmap by version:', error);
    throw error;
  }
};

/**
 * Create a new mindmap
 * @param {number} projectId - The project ID
 * @param {Object} data - Mindmap data
 * @returns {Promise<Object>} Created mindmap
 */
const createMindmap = async (projectId, data) => {
  try {
    const { name, versionId } = data;

    const mindmap = await prisma.mindmap.create({
      data: {
        projectId,
        versionId: versionId || null,
        name: name || 'Untitled Mindmap'
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    return {
      mindmapId: mindmap.mindmapId,
      projectId: mindmap.projectId,
      versionId: mindmap.versionId,
      name: mindmap.name,
      createdAt: mindmap.createdAt,
      updatedAt: mindmap.updatedAt
    };
  } catch (error) {
    console.error('Error creating mindmap:', error);
    throw error;
  }
};

/**
 * Update a mindmap with nodes and edges
 * @param {number} mindmapId - The mindmap ID
 * @param {Object} data - Update data with nodes and edges
 * @returns {Promise<Object>} Updated mindmap
 */
const updateMindmap = async (mindmapId, data) => {
  try {
    const { name, nodes, edges } = data;

    // First update the mindmap basic info
    const updateData = {};
    if (name !== undefined) updateData.name = name;

    // If nodes are provided, delete old nodes and create new ones
    if (nodes) {
      const deleteResult = await prisma.mindmapNode.deleteMany({ where: { mindmapId } });
      console.log(`Deleted ${deleteResult.count} nodes for mindmap ${mindmapId}`);
      
      if (nodes.length > 0) {
        // Use upsert to handle potential race conditions
        for (const node of nodes) {
          try {
            const externalId = node.id || node.externalId;
            // First try to delete any existing node with this externalId
            await prisma.mindmapNode.deleteMany({
              where: {
                mindmapId_externalId: {
                  mindmapId,
                  externalId
                }
              }
            }).catch(() => {}); // Ignore if doesn't exist
            
            // Then create the new node
            await prisma.mindmapNode.create({
              data: {
                mindmapId,
                externalId,
                label: node.data?.label || node.label || 'Untitled',
                nodeType: node.data?.nodeType || node.nodeType || 'action',
                positionX: node.position?.x || node.positionX || 0,
                positionY: node.position?.y || node.positionY || 0,
                color: node.data?.color || node.color || '#3b82f6',
                fontSize: node.data?.fontSize || node.fontSize || 14,
                isRoot: node.data?.isRoot || node.isRoot || false
              }
            });
          } catch (e) {
            console.warn('Error creating node:', e.message);
          }
        }
      }
    }

    // If edges are provided, delete old edges and create new ones
    if (edges) {
      // First delete all existing edges
      const deleteResult = await prisma.mindmapEdge.deleteMany({ where: { mindmapId } });
      console.log(`Deleted ${deleteResult.count} edges for mindmap ${mindmapId}`);
      
      if (edges.length > 0) {
        // Use upsert to handle potential race conditions
        for (const edge of edges) {
          try {
            const externalId = edge.id || edge.externalId;
            // First try to delete any existing edge with this externalId
            await prisma.mindmapEdge.deleteMany({
              where: {
                mindmapId_externalId: {
                  mindmapId,
                  externalId
                }
              }
            }).catch(() => {}); // Ignore if doesn't exist
            
            // Then create the new edge
            await prisma.mindmapEdge.create({
              data: {
                mindmapId,
                externalId,
                source: edge.source,
                target: edge.target
              }
            });
          } catch (e) {
            console.warn('Error creating edge:', e.message);
          }
        }
      }
    }

    // Update mindmap with new name if provided
    if (name) {
      await prisma.mindmap.update({
        where: { mindmapId },
        data: { name }
      });
    }

    // Fetch and return the updated mindmap
    const mindmap = await getMindmapById(mindmapId);
    return mindmap;
  } catch (error) {
    console.error('Error updating mindmap:', error);
    throw error;
  }
};

/**
 * Delete a mindmap
 * @param {number} mindmapId - The mindmap ID
 * @returns {Promise<void>}
 */
const deleteMindmap = async (mindmapId) => {
  try {
    // Nodes and edges will be cascade deleted
    await prisma.mindmap.delete({
      where: { mindmapId }
    });
  } catch (error) {
    console.error('Error deleting mindmap:', error);
    throw error;
  }
};

/**
 * Save mindmap with a specific version
 * @param {number} projectId - The project ID
 * @param {number} versionId - The version ID
 * @param {Array} nodes - Array of mindmap nodes with positions
 * @param {Array} edges - Array of mindmap edges
 * @returns {Promise<Object>} Saved mindmap
 */
const saveMindmapWithVersion = async (projectId, versionId, nodes, edges) => {
  try {
    console.log('saveMindmapWithVersion called:', { projectId, versionId, nodesCount: nodes?.length, edgesCount: edges?.length });
    
    // First check if a mindmap already exists for this version
    let mindmap = await prisma.mindmap.findFirst({
      where: { versionId }
    });

    if (mindmap) {
      // Update existing mindmap
      mindmap = await updateMindmap(mindmap.mindmapId, { nodes, edges });
    } else {
      // Create new mindmap for this version
      mindmap = await prisma.mindmap.create({
        data: {
          projectId,
          versionId,
          name: `Mindmap - Version ${versionId}`
        }
      });

      // Add nodes and edges
      if (nodes && nodes.length > 0) {
        await prisma.mindmapNode.createMany({
          data: nodes.map(node => ({
            mindmapId: mindmap.mindmapId,
            externalId: node.id || node.externalId,
            label: node.data?.label || node.label || 'Untitled',
            nodeType: node.data?.nodeType || node.nodeType || 'action',
            positionX: node.position?.x || node.positionX || 0,
            positionY: node.position?.y || node.positionY || 0,
            color: node.data?.color || node.color || '#3b82f6',
            fontSize: node.data?.fontSize || node.fontSize || 14,
            isRoot: node.data?.isRoot || node.isRoot || false
          }))
        });
      }

      if (edges && edges.length > 0) {
        await prisma.mindmapEdge.createMany({
          data: edges.map(edge => ({
            mindmapId: mindmap.mindmapId,
            externalId: edge.id || edge.externalId,
            source: edge.source,
            target: edge.target
          }))
        });
      }

      // Fetch the complete mindmap
      mindmap = await getMindmapById(mindmap.mindmapId);
    }

    return mindmap;
  } catch (error) {
    console.error('Error saving mindmap with version:', error);
    console.error('Error details:', error.message, error.stack);
    throw error;
  }
};

/**
 * Duplicate a mindmap for a new version (copy all nodes and edges with positions)
 * @param {number} sourceVersionId - Source version ID to duplicate from
 * @param {number} targetVersionId - Target version ID to duplicate to
 * @returns {Promise<Object>} New mindmap
 */
const duplicateMindmapForVersion = async (sourceVersionId, targetVersionId) => {
  try {
    // Find the source mindmap
    const sourceMindmap = await prisma.mindmap.findFirst({
      where: { versionId: sourceVersionId },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!sourceMindmap) {
      // No mindmap to duplicate, just return null
      return null;
    }

    // Create new mindmap for the target version
    const newMindmap = await prisma.mindmap.create({
      data: {
        projectId: sourceMindmap.projectId,
        versionId: targetVersionId,
        name: `${sourceMindmap.name} (Copy)`
      }
    });

    // Map to store old externalId to new externalId for edge duplication
    const nodeIdMap = new Map();

    // Duplicate nodes with their positions preserved
    if (sourceMindmap.nodes && sourceMindmap.nodes.length > 0) {
      const newNodes = await prisma.mindmapNode.createMany({
        data: sourceMindmap.nodes.map(node => {
          const newExternalId = `${node.externalId}_copy_${Date.now()}`;
          nodeIdMap.set(node.externalId, newExternalId);
          
          return {
            mindmapId: newMindmap.mindmapId,
            externalId: newExternalId,
            label: node.label,
            nodeType: node.nodeType,
            positionX: node.positionX,  // PRESERVE POSITIONS
            positionY: node.positionY,  // PRESERVE POSITIONS
            color: node.color,
            fontSize: node.fontSize,
            isRoot: node.isRoot
          };
        }),
        returning: true
      });
    }

    // Duplicate edges with the new node IDs
    if (sourceMindmap.edges && sourceMindmap.edges.length > 0) {
      await prisma.mindmapEdge.createMany({
        data: sourceMindmap.edges.map(edge => ({
          mindmapId: newMindmap.mindmapId,
          externalId: `${edge.externalId}_copy_${Date.now()}`,
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target
        }))
      });
    }

    // Fetch and return the new mindmap
    const result = await getMindmapById(newMindmap.mindmapId);
    return result;
  } catch (error) {
    console.error('Error duplicating mindmap for version:', error);
    throw error;
  }
};

module.exports = {
  saveMindmapAsTasks,
  importMindmapAsTasks,
  mapNodeTypeToTaskType,
  isDescriptionNodeType,
  isLivrableNodeType,
  // Version-related functions
  getMindmapsForProject,
  getMindmapById,
  getMindmapByVersion,
  createMindmap,
  updateMindmap,
  deleteMindmap,
  saveMindmapWithVersion,
  duplicateMindmapForVersion,
};
