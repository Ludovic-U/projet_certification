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
      projectId, 
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
    console.log('updateTask - received files:', req.body.files);
    const taskData = {
      projectId,
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

/**
 * Import Mistral JSON data and create tasks
 * POST /api/gantt/import/:projectId
 */
module.exports.importGanttData = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    let data = req.body;
    console.log('Import request received for project:', projectId);
    console.log('Data received type:', typeof data);
    console.log('Data received:', JSON.stringify(data, null, 2));
    
    // Handle different possible data formats
    // Try various common formats from Mistral responses
    let tasks = null;
    
    if (Array.isArray(data)) {
      tasks = data;
    } else if (data && typeof data === 'object') {
      // Try common property names
      tasks = data.data || data.tasks || data.tasksArray || 
              (data.result && (data.result.tasks || data.result.data)) ||
              (data.gantt && data.gantt.tasks) ||
              Object.values(data).find(val => Array.isArray(val));
    }
    
    console.log('Extracted tasks:', JSON.stringify(tasks.slice(0, 2), null, 2));
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid format: expected an array of tasks',
        receivedType: typeof data,
        receivedKeys: data ? Object.keys(data) : 'N/A'
      });
    }

    // Build a map of original IDs to new IDs for handling dependencies
    const idMap = new Map();
    const createdTasks = [];

    // First pass: create all tasks
    for (const taskData of tasks) {
      console.log('Creating task with data:', JSON.stringify(taskData, null, 2));
      
      // Extract fields with flexible naming for Mistral response
      const taskInput = {
        projectId,
        name: taskData.text || taskData.name || taskData.label || taskData.title || 'Untitled Task',
        description: taskData.details || taskData.description || taskData.summary || '',
        startDate: taskData.start || taskData.startDate || taskData.start_date || taskData.debut,
        endDate: taskData.end || taskData.endDate || taskData.end_date || taskData.fin,
        progress: taskData.progress || taskData.pourcentage || taskData.completion || 0,
        parentId: null, // Will be updated in second pass if parent ID exists
        type: taskData.type || taskData.type_tache || 'task',
        details: taskData.details || taskData.description || '',
        notes: taskData.notes || taskData.commentaires || '',
        files: taskData.files || [],
        goal: taskData.goal || taskData.objectif || '',
        subActionId: null // Tasks from Mistral don't have subActions
      };

      console.log('Mapped task input:', JSON.stringify(taskInput, null, 2));

      const created = await createTask(taskInput);
      idMap.set(taskData.id || taskData.id_tache || taskData.taskId, created.taskId);
      createdTasks.push(created);
    }

    // Second pass: update parent references and create links
    for (let i = 0; i < tasks.length; i++) {
      const taskData = tasks[i];
      const newTaskId = idMap.get(taskData.id);

      // Update parent reference if needed
      if (taskData.parent && taskData.parent !== 0 && idMap.has(taskData.parent)) {
        await updateTask(newTaskId, { parentId: idMap.get(taskData.parent) });
      }

      // Create links if dependencies exist
      if (taskData.dependencies && Array.isArray(taskData.dependencies)) {
        for (const depId of taskData.dependencies) {
          if (idMap.has(depId)) {
            await createTaskLink({
              source: idMap.get(depId),
              target: newTaskId,
              type: 0
            });
          }
        }
      }
    }

    console.log('Import successful, created tasks:', createdTasks.length);
    
    res.status(201).json({ 
      message: 'Tasks imported successfully',
      count: createdTasks.length,
      tasks: createdTasks
    });
  } catch (error) {
    console.error('Error importing Gantt data:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to import Gantt data: ' + error.message });
  }
};
