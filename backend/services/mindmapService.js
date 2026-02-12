const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Map nodeType from mindmap to task type
 */
const mapNodeTypeToTaskType = (nodeType) => {
  const mapping = {
    'action': 'task',
    'sous_action': 'task',
    'objectif': 'milestone',
    'livrable': 'milestone',
    'root': 'project',
  };
  return mapping[nodeType] || 'task';
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
 * Save mindmap nodes as Tasks - Upsert approach (update if exists, create if not)
 * This is for incremental saves - preserves existing tasks
 */
const saveMindmapAsTasks = async (projectId, nodes, edges) => {
  const createdTasks = [];
  const nodeIdToTaskId = {};

  // Get all existing mindmap tasks for this project
  const existingTasks = await prisma.task.findMany({
    where: {
      projectId,
      details: {
        contains: '"mindmapId":0',
      },
    },
  });

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

  // Process each node - upsert
  for (const node of nodes) {
    const existingTaskId = existingNodeIdToTaskId[node.id];
    const taskData = {
      projectId,
      name: node.data?.label || 'Untitled',
      type: mapNodeTypeToTaskType(node.data?.nodeType || 'action'),
      color: node.data?.color || '#3b82f6',
      details: JSON.stringify({
        mindmapId: 0,
        nodeId: node.id,
        nodeType: node.data?.nodeType || 'action',
        positionX: node.position?.x || 0,
        positionY: node.position?.y || 0,
        isRoot: node.data?.isRoot || false,
      }),
    };

    let task;
    if (existingTaskId) {
      // Update existing task
      task = await prisma.task.update({
        where: { taskId: existingTaskId },
        data: taskData,
      });
    } else {
      // Create new task
      task = await prisma.task.create({
        data: taskData,
      });
    }

    createdTasks.push(task);
    nodeIdToTaskId[node.id] = task.taskId;
  }

  // Reset parent relationships - will be set below
  for (const nodeId of Object.keys(existingNodeIdToTaskId)) {
    const taskId = existingNodeIdToTaskId[nodeId];
    await prisma.task.update({
      where: { taskId },
      data: { parentId: null },
    });
  }

  // Set parent-child relationships based on edges
  for (const edge of edges) {
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
 * Import mindmap nodes as Tasks - Fresh import approach
 * Deletes all existing mindmap tasks first, then creates new ones
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

  // Then create all tasks fresh
  const createdTasks = [];
  const nodeIdToTaskId = {};

  for (const node of nodes) {
    const task = await prisma.task.create({
      data: {
        projectId,
        name: node.data?.label || 'Untitled',
        type: mapNodeTypeToTaskType(node.data?.nodeType || 'action'),
        color: node.data?.color || '#3b82f6',
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
    createdTasks.push(task);
    nodeIdToTaskId[node.id] = task.taskId;
  }

  // Set parent-child relationships based on edges
  for (const edge of edges) {
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
};
