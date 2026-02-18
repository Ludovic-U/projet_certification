const prisma = require('../prisma/prismaClient');
const {
  getGanttData,
  createTask,
  updateTask,
  deleteTask,
  createTaskLink,
  deleteTaskLink,
  createDeliverable,
  getSubActionsForProject,
  createTaskExpense,
  createTaskAssigneeDetail,
  createTaskDeliverableStatus,
  updateTaskDeliverable,
  confirmTaskDeliverable,
  deleteTaskDeliverable,
  getTaskDeliverables,
  calculateDeliverableProgress,
  calculateAndUpdateSubActionProgress,
  getVersionsForProject,
  createVersion,
  updateVersion,
  deleteVersion,
  setActiveVersion
} = require('../services/ganttService');
const { validateId } = require('../middlewares/validateId');

/**
 * Get all Gantt data for a project
 * GET /api/gantt/:projectId
 */
module.exports.getGanttData = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const versionId = req.query.versionId ? Number(req.query.versionId) : null;
  
  if (!validateId(projectId, 'projectId', res)) return;
  
  try {
    const data = await getGanttData(projectId, versionId);
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
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
  // subActionId is optional - tasks can be created without a subAction
  const subActionId = req.body.subActionId ? Number(req.body.subActionId) : null;
  
  try {
    const taskData = {
      projectId, 
      subActionId,
      versionId: req.body.versionId ? Number(req.body.versionId) : null,
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
      color: req.body.color,
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
  
  // Use validateId correctly - it returns a middleware function
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ error: 'Invalid taskId' });
  }
  
  try {
    console.log('updateTask - received files:', req.body.files);
    const taskData = {
      projectId,
      versionId: req.body.versionId !== undefined ? (req.body.versionId ? Number(req.body.versionId) : null) : undefined,
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
      color: req.body.color,
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
  
  // Validate IDs
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ error: 'Invalid taskId' });
  }
  
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
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
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
  
  // Validate IDs
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(linkId) || linkId <= 0) {
    return res.status(400).json({ error: 'Invalid linkId' });
  }
  
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
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
  try {
    // Support both taskId (for task deliverables) and subActionId (legacy)
    const deliverableData = {
      taskId: req.body.taskId ? Number(req.body.taskId) : undefined,
      subActionId: req.body.subActionId ? Number(req.body.subActionId) : undefined,
      label: req.body.label,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate
    };

    const deliverable = await createDeliverable(deliverableData);
    
    // Recalculate progress after creating new deliverable
    if (deliverableData.taskId) {
      const newProgress = await calculateDeliverableProgress(deliverableData.taskId);
      await updateTask(deliverableData.taskId, { progress: newProgress });
      // Update parent SubAction progress
      await calculateAndUpdateSubActionProgress(deliverableData.taskId);
    }
    
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
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
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
const { updateTask: updateTaskService } = require('../services/ganttService');

module.exports.bulkUpdateTasks = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId - allow 0 for testing
  if (!projectId || isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid projectId: ' + projectId });
  }
  
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    // Update each task with the provided fields
    const updatedTasks = [];
    for (const taskData of tasks) {
      const taskId = Number(taskData.id);
      
      // Skip invalid task IDs
      if (!taskId || isNaN(taskId)) {
        console.error('Invalid taskId in bulk update:', taskData.id);
        continue;
      }
      
      const updateData = {
        startDate: taskData.start,
        endDate: taskData.end,
        progress: taskData.progress,
        parentId: taskData.parent !== undefined && taskData.parent !== 0 ? Number(taskData.parent) : null
      };
      
      console.log('bulkUpdateTasks - updating task:', taskId, updateData);
      
      try {
        const updated = await updateTaskService(taskId, updateData);
        updatedTasks.push(updated);
      } catch (updateError) {
        console.error('Error updating task', taskId, ':', updateError.message);
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
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
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
      
      // Get original ID (handle different field names consistently)
      const originalId = taskData.id !== undefined ? taskData.id : 
                        (taskData.id_tache !== undefined ? taskData.id_tache : taskData.taskId);
      
      console.log('Original ID:', originalId);
      
      if (originalId === undefined) {
        console.log('Warning: Task missing ID field, skipping...');
        continue;
      }
      
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
      idMap.set(originalId, created.id);  // createTask returns 'id', not 'taskId'
      createdTasks.push(created);
      
      console.log('Created task with new ID:', created.id, ', mapped from original ID:', originalId);
      
      // Create expenses for this task (from Mistral)
      if (taskData.expenses && Array.isArray(taskData.expenses)) {
        for (const expense of taskData.expenses) {
          try {
            await createTaskExpense({
              taskId: created.id,
              type: expense.type || 'other',
              name: expense.name || '',
              unit: expense.unit || null,
              unitPrice: expense.unit_price || expense.unitPrice || null
            });
          } catch (expenseErr) {
            console.error('Error creating expense:', expenseErr);
          }
        }
      }
      
      // Create assignee details for this task (from Mistral)
      if (taskData.assignees && Array.isArray(taskData.assignees)) {
        for (const assignee of taskData.assignees) {
          try {
            await createTaskAssigneeDetail({
              taskId: created.id,
              assigneeName: assignee.name || '',
              hoursAssigned: assignee.hours_assigned || assignee.hoursAssigned || null,
              dailyCost: assignee.daily_cost || assignee.dailyCost || null
            });
          } catch (assigneeErr) {
            console.error('Error creating assignee detail:', assigneeErr);
          }
        }
      }
      
      // Create deliverables for this task (from Mistral)
      if (taskData.deliverables && Array.isArray(taskData.deliverables)) {
        for (const deliverable of taskData.deliverables) {
          try {
            await createTaskDeliverableStatus({
              taskId: created.id,
              name: deliverable.name || '',
              delivered: deliverable.delivered || false,
              uploaded: deliverable.uploaded || false,
              filePath: deliverable.file_path || deliverable.filePath || null
            });
          } catch (deliverableErr) {
            console.error('Error creating deliverable status:', deliverableErr);
          }
        }
      }
    }

    // Second pass: update parent references and create links
    console.log('Starting second pass - idMap entries:', Array.from(idMap.entries()));
    
    for (let i = 0; i < tasks.length; i++) {
      const taskData = tasks[i];
      
      // Get original ID (handle different field names consistently)
      const originalId = taskData.id !== undefined ? taskData.id : 
                        (taskData.id_tache !== undefined ? taskData.id_tache : taskData.taskId);
      
      const newTaskId = idMap.get(originalId);
      
      // Skip if this task wasn't created (shouldn't happen)
      if (!newTaskId) {
        console.log('Warning: Task not found in idMap for original ID:', originalId);
        continue;
      }
      
      // Check both parent (no underscore) and parent_id (with underscore) for compatibility
      const originalParentId = taskData.parent_id !== undefined ? taskData.parent_id : taskData.parent;

      console.log(`Processing task: originalId=${originalId}, newTaskId=${newTaskId}, originalParentId=${originalParentId}`);
      console.log(`  idMap.has(${originalParentId}) = ${idMap.has(originalParentId)}`);

      // Update parent reference if needed
      if (originalParentId && originalParentId !== 0 && idMap.has(originalParentId)) {
        const newParentId = idMap.get(originalParentId);
        console.log(`  Updating parent: setting parentId=${newParentId} for task ${newTaskId}`);
        await updateTask(newTaskId, { parentId: newParentId });
      } else {
        console.log(`  NOT updating parent: originalParentId=${originalParentId}, idMap.has=${idMap.has(originalParentId)}`);
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

/**
 * Get all versions for a project
 * GET /api/gantt/:projectId/versions
 */
module.exports.getVersions = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
  try {
    const versions = await getVersionsForProject(projectId);
    res.status(200).json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
};

/**
 * Create a new version with optional duplication from source version
 * POST /api/gantt/:projectId/versions
 */
module.exports.createVersion = async (req, res) => {
  const projectId = Number(req.params.projectId);
  
  // Validate projectId
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  
  try {
    const versionData = {
      projectId,
      name: req.body.name,
      description: req.body.description || null,
      isActive: req.body.isActive || false
    };

    // Get source version ID for duplication (optional, can be null for main version)
    const sourceVersionId = req.body.sourceVersionId !== undefined 
      ? (req.body.sourceVersionId === null ? null : Number(req.body.sourceVersionId)) 
      : null;

    const version = await createVersion(versionData, sourceVersionId);
    res.status(201).json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: error.message || 'Failed to create version' });
  }
};

/**
 * Update a version
 * PUT /api/gantt/:projectId/versions/:versionId
 */
module.exports.updateVersion = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const versionId = Number(req.params.versionId);
  
  // Validate IDs
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(versionId) || versionId <= 0) {
    return res.status(400).json({ error: 'Invalid versionId' });
  }
  
  try {
    const versionData = {
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive
    };

    const version = await updateVersion(versionId, versionData);
    res.status(200).json(version);
  } catch (error) {
    console.error('Error updating version:', error);
    if (error.message === 'Version not found') {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.status(500).json({ error: 'Failed to update version' });
  }
};

/**
 * Delete a version
 * DELETE /api/gantt/:projectId/versions/:versionId
 */
module.exports.deleteVersion = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const versionId = Number(req.params.versionId);
  
  // Validate IDs
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(versionId) || versionId <= 0) {
    return res.status(400).json({ error: 'Invalid versionId' });
  }
  
  try {
    const result = await deleteVersion(versionId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting version:', error);
    if (error.message === 'Version not found') {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.status(500).json({ error: 'Failed to delete version' });
  }
};

/**
 * Set a version as active (and deactivate others)
 * PUT /api/gantt/:projectId/versions/:versionId/activate
 */
module.exports.activateVersion = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const versionId = Number(req.params.versionId);
  
  // Validate IDs
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ error: 'Invalid projectId' });
  }
  if (!Number.isInteger(versionId) || versionId <= 0) {
    return res.status(400).json({ error: 'Invalid versionId' });
  }
  
  try {
    const version = await setActiveVersion(projectId, versionId);
    res.status(200).json(version);
  } catch (error) {
    console.error('Error activating version:', error);
    if (error.message === 'Version not found') {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.status(500).json({ error: 'Failed to activate version' });
  }
};

/**
 * Create a new task deliverable
 * POST /api/gantt/:projectId/tasks/:taskId/deliverables
 */
module.exports.createTaskDeliverable = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  
  try {
    const deliverable = await createTaskDeliverableStatus({
      taskId,
      name: req.body.name
    });
    
    res.status(201).json(deliverable);
  } catch (error) {
    console.error('Error creating task deliverable:', error);
    res.status(500).json({ error: error.message || 'Failed to create task deliverable' });
  }
};

/**
 * Update a task deliverable with file upload
 * PUT /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId
 */
module.exports.updateTaskDeliverable = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  const deliverableId = Number(req.params.deliverableId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  if (!validateId(deliverableId, 'deliverableId', res)) return;
  
  try {
    const deliverable = await updateTaskDeliverable(deliverableId, {
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName,
      notes: req.body.notes
    });
    
    // Calculate new progress based on confirmed deliverables
    const newProgress = await calculateDeliverableProgress(taskId);
    
    // Update task progress if it changed (always update, even if 0)
    await updateTask(taskId, { progress: newProgress });
    
    // Update parent SubAction progress
    await calculateAndUpdateSubActionProgress(taskId);
    
    res.status(200).json({ ...deliverable, progress: newProgress });
  } catch (error) {
    console.error('Error updating task deliverable:', error);
    res.status(500).json({ error: error.message || 'Failed to update task deliverable' });
  }
};

/**
 * Confirm a task deliverable
 * PUT /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId/confirm
 */
module.exports.confirmTaskDeliverable = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  const deliverableId = Number(req.params.deliverableId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  if (!validateId(deliverableId, 'deliverableId', res)) return;
  
  try {
    const deliverable = await confirmTaskDeliverable(deliverableId);
    
    // Calculate new progress based on confirmed deliverables
    const newProgress = await calculateDeliverableProgress(taskId);
    
    // Update task progress
    await updateTask(taskId, { progress: newProgress });
    
    // Update parent SubAction progress
    await calculateAndUpdateSubActionProgress(taskId);
    
    res.status(200).json({ ...deliverable, progress: newProgress });
  } catch (error) {
    console.error('Error confirming task deliverable:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm task deliverable' });
  }
};

/**
 * Delete a task deliverable
 * DELETE /api/gantt/:projectId/tasks/:taskId/deliverables/:deliverableId
 */
module.exports.deleteTaskDeliverable = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  const deliverableId = Number(req.params.deliverableId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  if (!validateId(deliverableId, 'deliverableId', res)) return;
  
  try {
    await deleteTaskDeliverable(deliverableId);
    
    // Recalculate progress after deletion
    const newProgress = await calculateDeliverableProgress(taskId);
    await updateTask(taskId, { progress: newProgress });
    
    // Update parent SubAction progress
    await calculateAndUpdateSubActionProgress(taskId);
    
    res.status(200).json({ message: 'Deliverable deleted successfully', progress: newProgress });
  } catch (error) {
    console.error('Error deleting task deliverable:', error);
    res.status(500).json({ error: error.message || 'Failed to delete task deliverable' });
  }
};

/**
 * Get all deliverables for a task
 * GET /api/gantt/:projectId/tasks/:taskId/deliverables
 */
module.exports.getTaskDeliverables = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  
  if (!validateId(projectId, 'projectId', res)) return;
  if (!validateId(taskId, 'taskId', res)) return;
  
  try {
    const deliverables = await getTaskDeliverables(taskId);
    res.status(200).json(deliverables);
  } catch (error) {
    console.error('Error getting task deliverables:', error);
    res.status(500).json({ error: error.message || 'Failed to get task deliverables' });
  }
};
