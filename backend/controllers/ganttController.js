const prisma = require('../prisma/prismaClient');
const {
  getGanttData,
  createTask,
  updateTask,
  deleteTask,
  createTaskLink,
  deleteTaskLink,
  createDeliverable,
  getSubActionsForProject
} = require('../services/ganttService');
const { validateId } = require('../middlewares/validateId');

/**
 * Get all Gantt data for a project
 * GET /api/gantt/:projectId
 */
module.exports.getGanttData = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const data = await getGanttData(projectId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Gantt data:', error);
    res.status(500).json({ error: 'Failed to fetch Gantt data' });
  }
};

/**
 * Create a new task
 * POST /api/gantt/:projectId/tasks
 */
module.exports.createTask = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  // subActionId is optional - tasks can be created without a subAction
  const subActionId = req.body.subActionId ? Number(req.body.subActionId) : null;
  
  try {
    const taskData = {
      subActionId,
      name: req.body.text || req.body.name,
      description: req.body.details || req.body.description,
      startDate: req.body.start,
      endDate: req.body.end,
      progress: req.body.progress || 0,
      parentId: req.body.parent && req.body.parent !== 0 ? Number(req.body.parent) : null,
      type: req.body.type || 'task',
      details: req.body.details,
      notes: req.body.notes || '',
      files: req.body.files || [],
      goal: req.body.goal,
      assigneeIds: req.body.assigneeIds || [],
      livrableIds: req.body.livrableIds || []
    };

    const task = await createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message || 'Failed to create task' });
  }
};

/**
 * Update a task
 * PUT /api/gantt/:projectId/tasks/:taskId
 */
module.exports.updateTask = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  
  try {
    const taskData = {
      name: req.body.text !== undefined ? req.body.text : req.body.name,
      description: req.body.details !== undefined ? req.body.details : req.body.description,
      startDate: req.body.start,
      endDate: req.body.end,
      progress: req.body.progress,
      parentId: req.body.parent !== undefined && req.body.parent !== 0 ? Number(req.body.parent) : null,
      type: req.body.type,
      details: req.body.details,
      notes: req.body.notes,
      files: req.body.files,
      goal: req.body.goal,
      assigneeIds: req.body.assigneeIds,
      livrableIds: req.body.livrableIds
    };

    const task = await updateTask(taskId, taskData);
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Delete a task
 * DELETE /api/gantt/:projectId/tasks/:taskId
 */
module.exports.deleteTask = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  
  try {
    const task = await deleteTask(taskId);
    res.status(200).json({ message: 'Task deleted successfully', task });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Create a new task link
 * POST /api/gantt/:projectId/links
 */
module.exports.createTaskLink = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const linkData = {
      source: Number(req.body.source),
      target: Number(req.body.target),
      type: req.body.type || 0
    };

    const link = await createTaskLink(linkData);
    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating task link:', error);
    res.status(500).json({ error: 'Failed to create task link' });
  }
};

/**
 * Delete a task link
 * DELETE /api/gantt/:projectId/links/:linkId
 */
module.exports.deleteTaskLink = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const linkId = Number(req.params.linkId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(linkId, 'linkId', res)) return;
  
  try {
    const link = await deleteTaskLink(linkId);
    res.status(200).json({ message: 'Task link deleted successfully', link });
  } catch (error) {
    console.error('Error deleting task link:', error);
    res.status(500).json({ error: 'Failed to delete task link' });
  }
};

/**
 * Create a new deliverable
 * POST /api/gantt/:projectId/deliverables
 */
module.exports.createDeliverable = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const deliverableData = {
      subActionId: Number(req.body.subActionId),
      label: req.body.label,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate
    };

    const deliverable = await createDeliverable(deliverableData);
    res.status(201).json(deliverable);
  } catch (error) {
    console.error('Error creating deliverable:', error);
    res.status(500).json({ error: 'Failed to create deliverable' });
  }
};

/**
 * Get subActions for a project (for task creation dropdown)
 * GET /api/gantt/:projectId/subactions
 */
module.exports.getSubActions = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const subActions = await getSubActionsForProject(projectId);
    res.status(200).json(subActions);
  } catch (error) {
    console.error('Error fetching subActions:', error);
    res.status(500).json({ error: 'Failed to fetch subActions' });
  }
};

/**
 * Bulk update tasks (for drag/drop operations)
 * PUT /api/gantt/:projectId/tasks/bulk
 */
module.exports.bulkUpdateTasks = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    // Update each task with the provided fields
    const updatedTasks = [];
    for (const taskData of tasks) {
      if (taskData.id) {
        const updateData = {
          startDate: taskData.start,
          endDate: taskData.end,
          progress: taskData.progress,
          parentId: taskData.parent !== undefined && taskData.parent !== 0 ? Number(taskData.parent) : null
        };
        const updated = await updateTask(Number(taskData.id), updateData);
        updatedTasks.push(updated);
      }
    }

    res.status(200).json({ 
      message: 'Tasks updated successfully',
      tasks: updatedTasks 
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ error: 'Failed to bulk update tasks' });
  }
};
