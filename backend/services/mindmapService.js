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
 */
const mapNodeTypeToTaskType = (nodeType) => {
  const mapping = {
    'action': 'task',
    'sous_action': 'task',
    'root': 'project',
  };
  return mapping[nodeType] || 'task';
};

/**
 * Check if a node type should be stored as description
 */
const isDescriptionNodeType = (nodeType) => {
  return DESCRIPTION_NODE_TYPES.includes(nodeType);
};

/**
 * Check if a node type should be stored as livrable (deliverable)
 */
const isLivrableNodeType = (nodeType) => {
  return nodeType === 'livrable';
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
 */
const buildLivrableMap = async (projectId, nodes, edges) => {
  const parentToLivrables = {};

  // Process livrable nodes
  for (const node of nodes) {
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
  for (const node of nodes) {
    if (isDescriptionNodeType(node.data?.nodeType) || isLivrableNodeType(node.data?.nodeType)) {
      // Skip these nodes - they'll be handled separately
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
      details: JSON.stringify({
        mindmapId: 0,
        nodeId: node.id,
        nodeType: node.data?.nodeType || 'action',
        positionX: node.position?.x || 0,
        positionY: node.position?.y || 0,
        isRoot: node.data?.isRoot || false,
      }),
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
  for (const task of existingTasks) {
    try {
      const details = JSON.parse(task.details || '{}');
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
  for (const node of nodes) {
    if (isDescriptionNodeType(node.data?.nodeType) || isLivrableNodeType(node.data?.nodeType)) {
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
        details: JSON.stringify({
          mindmapId: 0,
          nodeId: node.id,
          nodeType: node.data?.nodeType || 'action',
          positionX: node.position?.x || 0,
          positionY: node.position?.y || 0,
          isRoot: node.data?.isRoot || false,
        }),
      },
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

module.exports = {
  saveMindmapAsTasks,
  importMindmapAsTasks,
  mapNodeTypeToTaskType,
  isDescriptionNodeType,
  isLivrableNodeType,
};
