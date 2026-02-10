const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all tasks for a project with all related data
 * @param {number} projectId - The project ID
 * @param {number} [versionId] - Optional version ID to filter tasks
 * @returns {Promise<Object>} Gantt data object with tasks, links, users, livrables
 */
module.exports.getGanttData = async (projectId, versionId = null) => {
  try {
    // Build the where clause with optional version filter
    const whereClause = {
      OR: [
        { projectId: projectId },
        {
          subAction: {
            action: {
              projectId: projectId
            }
          }
        }
      ]
    };
    
    // Add orphaned tasks filter (no project, no subAction, no parent)
    if (!versionId) {
      whereClause.OR.push({
        AND: [
          { projectId: null },
          { subActionId: null },
          { parentId: null }
        ]
      });
    }
    
    // Add version filter if provided
    if (versionId) {
      whereClause.versionId = versionId;
    }
    
    const projectTasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        taskAssignments: {
          include: {
            user: {
              select: {
                userId: true,
                firstname: true,
                lastname: true,
              }
            }
          }
        },
        children: true,
        linksSource: true,
        linksTarget: true,
        tasks: true,
        expenses: true,
        assigneeDetails: true,
        deliverables: true
      }
    });

    // Collect all task IDs (direct tasks + children + linked tasks)
    const allProjectTaskIds = new Set(projectTasks.map(t => t.taskId));
    
    // Add children IDs
    projectTasks.forEach(task => {
      task.children.forEach(child => {
        allProjectTaskIds.add(child.taskId);
      });
    });

    // Add linked task IDs
    projectTasks.forEach(task => {
      task.linksSource.forEach(link => {
        allProjectTaskIds.add(link.target);
      });
      task.linksTarget.forEach(link => {
        allProjectTaskIds.add(link.source);
      });
    });

    // If no project tasks, return empty data
    if (allProjectTaskIds.size === 0) {
      return {
        tasks: [],
        links: [],
        users: [],
        livrables: []
      };
    }

    // Get all related tasks (direct + children + linked)
    const allTasks = await prisma.task.findMany({
      where: {
        taskId: { in: Array.from(allProjectTaskIds) }
      },
      include: {
        taskAssignments: {
          include: {
            user: {
              select: {
                userId: true,
                firstname: true,
                lastname: true,
              }
            }
          }
        },
        children: true,
        linksSource: true,
        linksTarget: true,
        tasks: true,
        expenses: true,
        assigneeDetails: true,
        deliverables: true
      }
    });

    // Build task map with budget aggregation from expenses and assigneeDetails
    const taskMap = new Map();
    allTasks.forEach(task => {
      // Aggregate expenses into budget format
      const expenses = task.expenses || [];
      const assigneeDetails = task.assigneeDetails || [];
      
      // Calculate Moyen Humain (human resources) totals
      const moyenHumainCost = assigneeDetails.reduce((sum, a) => sum + (a.dailyCost || 0) * (a.hoursAssigned || 0) / 8, 0); // Assume 8h/day
      const personnelDays = assigneeDetails.reduce((sum, a) => sum + (a.hoursAssigned || 0) / 8, 0);
      
      // Categorize expenses by type
      const expensesByType = {
        'moyen-humain': expenses.filter(e => e.type === 'moyen-humain' || e.type === 'moyen_humain'),
        'amenagements': expenses.filter(e => e.type === 'amenagements' || e.type === 'amenagement-mobilier'),
        'equipements': expenses.filter(e => e.type === 'equipements' || e.type === 'equipements_pedagogiques'),
        'prestations': expenses.filter(e => e.type === 'prestations'),
        'communication': expenses.filter(e => e.type === 'communication' || e.type === 'communication-evenementiel'),
      };
      
      // Get expenses total by category
      const fittingsCost = expensesByType.amenagements.reduce((sum, e) => sum + (e.unitPrice || 0) * (e.unit ? parseInt(e.unit) : 1), 0);
      const educationalEquipmentCost = expensesByType.equipements.reduce((sum, e) => sum + (e.unitPrice || 0) * (e.unit ? parseInt(e.unit) : 1), 0);
      const subcontractorCost = expensesByType.prestations.reduce((sum, e) => sum + (e.unitPrice || 0) * (e.unit ? parseInt(e.unit) : 1), 0);
      const communicationCost = expensesByType.communication.reduce((sum, e) => sum + (e.unitPrice || 0) * (e.unit ? parseInt(e.unit) : 1), 0);
      
      // Create description from expenses
      const expensesDescription = expenses.map(e => `${e.name || ''} (${e.type || ''}): ${e.unitPrice || 0}€`).join('\n');
      
      taskMap.set(task.taskId, {
        id: task.taskId,
        text: task.name,
        start: task.startDate,
        end: task.endDate,
        progress: task.progress,
        parent: task.parentId || 0,
        type: task.type,
        details: task.details,
        notes: task.notes,
        files: task.files || [],
        assigneeIds: task.taskAssignments.map(ta => ta.userId),
        livrableIds: task.tasks.map(t => t.deliverableId),
        goal: task.goal,
        // Budget aggregated from expenses
        budget: {
          personnelDays: Math.round(personnelDays * 10) / 10,
          personnelCost: Math.round(moyenHumainCost * 100) / 100,
          internsDays: 0,
          internsCost: 0,
          amenagementsDescription: expensesDescription || '',
          fittingsCost: Math.round(fittingsCost * 100) / 100,
          educationalEquipmentCost: Math.round(educationalEquipmentCost * 100) / 100,
          subcontractorCost: Math.round(subcontractorCost * 100) / 100,
          travelCost: 0,
          otherPrestationsCost: 0,
          communicationCost: Math.round(communicationCost * 100) / 100,
          overheadRate: 0
        },
        // Raw data for advanced editing
        expenses: expenses.map(e => ({
          id: e.id,
          taskId: e.taskId,
          type: e.type,
          name: e.name,
          unit: e.unit,
          unitPrice: e.unitPrice
        })),
        assigneeDetails: assigneeDetails.map(a => ({
          id: a.id,
          taskId: a.taskId,
          name: a.assigneeName,
          hoursAssigned: a.hoursAssigned,
          dailyCost: a.dailyCost
        })),
        deliverables: (task.deliverables || []).map(d => ({
          id: d.id,
          taskId: d.taskId,
          name: d.name,
          delivered: d.delivered,
          uploaded: d.uploaded,
          filePath: d.filePath
        }))
      });
    });

    const tasks = Array.from(taskMap.values());

    // Get all links for tasks in this project
    const allTaskIds = tasks.map(t => t.id);
    const links = await prisma.taskLink.findMany({
      where: {
        OR: [
          { source: { in: allTaskIds } },
          { target: { in: allTaskIds } }
        ]
      }
    });

    // Format links for frontend
    const formattedLinks = links.map(link => ({
      id: link.linkId,
      source: link.source,
      target: link.target,
      type: link.type
    }));

    // Get all users for task assignments in this project
    const users = await prisma.user.findMany({
      where: {
        taskAssignments: {
          some: {
            task: {
              taskId: { in: allTaskIds }
            }
          }
        }
      },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.userId,
      label: `${user.firstname} ${user.lastname}`
    }));

    // Get all deliverables for tasks in this project
    const deliverables = await prisma.deliverable.findMany({
      where: {
        tasks: {
          some: {
            taskId: { in: allTaskIds }
          }
        }
      }
    });

    const formattedLivrables = deliverables.map(d => ({
      id: d.deliverableId,
      label: d.label || d.file,
      description: d.description || ''
    }));

    return {
      tasks,
      links: formattedLinks,
      users: formattedUsers,
      livrables: formattedLivrables
    };
  } catch (error) {
    console.error('Error fetching Gantt data:', error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
module.exports.createTask = async (taskData) => {
  try {
    const {
      projectId,
      versionId,
      name,
      description,
      startDate,
      endDate,
      progress = 0,
      parentId = null,
      type = 'task',
      details = null,
      notes = '',
      files = [],
      goal = null,
      assigneeIds = [],
      livrableIds = []
    } = taskData;

    // Create the task with projectId and optional versionId
    const task = await prisma.task.create({
      data: {
        projectId: projectId || null,
        versionId: versionId || null,
        name: name || 'New Task',
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        progress,
        parentId: parentId || null,
        type: type || 'task',
        details: details || null,
        notes: notes || '',
        files: files || [],
        goal: goal || null,
        taskAssignments: assigneeIds && assigneeIds.length > 0 ? {
          create: assigneeIds.map(userId => ({ userId: Number(userId) }))
        } : undefined,
      },
      include: {
        taskAssignments: {
          include: {
            user: {
              select: {
                userId: true,
                firstname: true,
                lastname: true,
              }
            }
          }
        }
      }
    });

    // Create task-livrable relations if provided
    if (livrableIds && livrableIds.length > 0) {
      await prisma.task.update({
        where: { taskId: task.taskId },
        data: {
          tasks: {
            connect: livrableIds.map(livrableId => ({ deliverableId: Number(livrableId) }))
          }
        }
      });
    }

    return {
      id: task.taskId,
      text: task.name,
      start: task.startDate,
      end: task.endDate,
      progress: task.progress,
      parent: task.parentId || 0,
      type: task.type,
      details: task.details,
      notes: task.notes,
      files: task.files || [],
      assigneeIds: task.taskAssignments.map(ta => ta.userId),
      livrableIds: livrableIds || [],
      goal: task.goal,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update a task
 * @param {number} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task
 */
module.exports.updateTask = async (taskId, taskData) => {
  try {
    const {
      projectId,
      versionId,
      name,
      description,
      startDate,
      endDate,
      progress,
      parentId,
      type,
      details,
      notes,
      files,
      goal,
      assigneeIds,
      livrableIds
    } = taskData;

    // First, get current assignments and livrables
    const currentTask = await prisma.task.findUnique({
      where: { taskId },
      include: {
        taskAssignments: true,
        tasks: true
      }
    });

    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Update the task
    const updateData = {};
    if (projectId !== undefined) updateData.projectId = projectId;
    if (versionId !== undefined) updateData.versionId = versionId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (progress !== undefined) updateData.progress = progress;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (type !== undefined) updateData.type = type;
    if (details !== undefined) updateData.details = details;
    if (notes !== undefined) updateData.notes = notes;
    if (files !== undefined) {
      console.log('updateTask - saving files to DB:', files);
      updateData.files = files;
    }
    if (goal !== undefined) updateData.goal = goal;

    const task = await prisma.task.update({
      where: { taskId },
      data: updateData,
      include: {
        taskAssignments: {
          include: {
            user: {
              select: {
                userId: true,
                firstname: true,
                lastname: true,
              }
            }
          }
        }
      }
    });

    // Update task assignments if provided
    if (assigneeIds !== undefined) {
      // Remove old assignments
      await prisma.taskAssignment.deleteMany({
        where: { taskId }
      });
      // Add new assignments
      if (assigneeIds.length > 0) {
        await prisma.taskAssignment.createMany({
          data: assigneeIds.map(userId => ({ taskId, userId }))
        });
      }
    }

    // Update task-livrable relations if provided
    if (livrableIds !== undefined) {
      // Remove old relations and add new ones
      await prisma.task.update({
        where: { taskId },
        data: {
          tasks: {
            set: livrableIds.map(livrableId => ({ deliverableId: Number(livrableId) }))
          }
        }
      });
    }

    return {
      id: task.taskId,
      text: task.name,
      start: task.startDate,
      end: task.endDate,
      progress: task.progress,
      parent: task.parentId || 0,
      type: task.type,
      details: task.details,
      notes: task.notes,
      files: task.files || [],
      assigneeIds: assigneeIds !== undefined ? assigneeIds : task.taskAssignments.map(ta => ta.userId),
      livrableIds: livrableIds !== undefined ? livrableIds : currentTask.tasks.map(t => t.deliverableId),
      goal: task.goal,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Helper function to recursively delete a task and all its children
 * @param {Object} tx - Prisma transaction client
 * @param {number} taskId - Task ID to delete
 */
async function deleteTaskAndChildren(tx, taskId) {
  // Get all children of this task
  const children = await tx.task.findMany({
    where: { parentId: taskId }
  });
  
  // Recursively delete each child first
  for (const child of children) {
    await deleteTaskAndChildren(tx, child.taskId);
  }
  
  // Now delete related data for this task
  await tx.taskAssignment.deleteMany({ where: { taskId } });
  await tx.taskLink.deleteMany({
    where: {
      OR: [{ source: taskId }, { target: taskId }]
    }
  });
  
  // Delete the task itself
  await tx.task.delete({
    where: { taskId }
  });
}

/**
 * Delete a task and all its subtasks
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} Deleted task
 */
module.exports.deleteTask = async (taskId) => {
  try {
    // Use a transaction to ensure all operations complete or none do
    const task = await prisma.$transaction(async (tx) => {
      // Recursively delete the task and all its children
      await deleteTaskAndChildren(tx, taskId);
      
      return { taskId };
    });

    return task;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Create a new task link
 * @param {Object} linkData - Link data
 * @returns {Promise<Object>} Created link
 */
module.exports.createTaskLink = async (linkData) => {
  try {
    const { source, target, type = 0 } = linkData;

    const link = await prisma.taskLink.create({
      data: {
        source,
        target,
        type
      }
    });

    return {
      id: link.linkId,
      source: link.source,
      target: link.target,
      type: link.type
    };
  } catch (error) {
    console.error('Error creating task link:', error);
    throw error;
  }
};

/**
 * Delete a task link
 * @param {number} linkId - Link ID
 * @returns {Promise<Object>} Deleted link
 */
module.exports.deleteTaskLink = async (linkId) => {
  try {
    const link = await prisma.taskLink.delete({
      where: { linkId }
    });

    return {
      id: link.linkId,
      source: link.source,
      target: link.target,
      type: link.type
    };
  } catch (error) {
    console.error('Error deleting task link:', error);
    throw error;
  }
};

/**
 * Create a new deliverable
 * @param {Object} deliverableData - Deliverable data
 * @returns {Promise<Object>} Created deliverable
 */
module.exports.createDeliverable = async (deliverableData) => {
  try {
    const { label, description, startDate, endDate } = deliverableData;

    const deliverable = await prisma.deliverable.create({
      data: {
        file: label,
        label,
        description,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date()
      }
    });

    return {
      id: deliverable.deliverableId,
      label: deliverable.label || deliverable.file,
      description: deliverable.description || ''
    };
  } catch (error) {
    console.error('Error creating deliverable:', error);
    throw error;
  }
};

/**
 * Get all subActions for a project (for task creation dropdown)
 * @param {number} projectId - Project ID
 * @returns {Promise<Array>} List of subActions with actions
 */
module.exports.getSubActionsForProject = async (projectId) => {
  try {
    const subActions = await prisma.subAction.findMany({
      where: {
        action: {
          projectId: projectId
        }
      },
      include: {
        action: {
          select: {
            actionId: true,
            actionName: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return subActions.map(sa => ({
      id: sa.subActionId,
      label: `${sa.action.actionName} - ${sa.description || 'SubAction'} (${sa.startDate.toISOString().split('T')[0]})`,
      actionId: sa.actionId,
      actionName: sa.action.actionName,
      startDate: sa.startDate,
      endDate: sa.endDate
    }));
  } catch (error) {
    console.error('Error fetching subActions:', error);
    throw error;
  }
};

/**
 * Create a task expense
 * @param {Object} expenseData - Expense data
 * @returns {Promise<Object>} Created expense
 */
module.exports.createTaskExpense = async (expenseData) => {
  try {
    const { taskId, type, name, unit, unitPrice } = expenseData;

    const expense = await prisma.taskExpense.create({
      data: {
        taskId,
        type: type || 'other',
        name: name || '',
        unit: unit || null,
        unitPrice: unitPrice || null
      }
    });

    return {
      id: expense.id,
      taskId: expense.taskId,
      type: expense.type,
      name: expense.name,
      unit: expense.unit,
      unitPrice: expense.unitPrice
    };
  } catch (error) {
    console.error('Error creating task expense:', error);
    throw error;
  }
};

/**
 * Create a task assignee detail
 * @param {Object} assigneeData - Assignee data
 * @returns {Promise<Object>} Created assignee detail
 */
module.exports.createTaskAssigneeDetail = async (assigneeData) => {
  try {
    const { taskId, assigneeName, hoursAssigned, dailyCost } = assigneeData;

    const assigneeDetail = await prisma.taskAssigneeDetail.create({
      data: {
        taskId,
        assigneeName: assigneeName || '',
        hoursAssigned: hoursAssigned || null,
        dailyCost: dailyCost || null
      }
    });

    return {
      id: assigneeDetail.id,
      taskId: assigneeDetail.taskId,
      assigneeName: assigneeDetail.assigneeName,
      hoursAssigned: assigneeDetail.hoursAssigned,
      dailyCost: assigneeDetail.dailyCost
    };
  } catch (error) {
    console.error('Error creating task assignee detail:', error);
    throw error;
  }
};

/**
 * Create a task deliverable status
 * @param {Object} deliverableData - Deliverable status data
 * @returns {Promise<Object>} Created deliverable status
 */
module.exports.createTaskDeliverableStatus = async (deliverableData) => {
  try {
    const { taskId, name, delivered, uploaded, filePath } = deliverableData;

    const deliverableStatus = await prisma.taskDeliverableStatus.create({
      data: {
        taskId,
        name: name || '',
        delivered: delivered || false,
        uploaded: uploaded || false,
        filePath: filePath || null
      }
    });

    return {
      id: deliverableStatus.id,
      taskId: deliverableStatus.taskId,
      name: deliverableStatus.name,
      delivered: deliverableStatus.delivered,
      uploaded: deliverableStatus.uploaded,
      filePath: deliverableStatus.filePath
    };
  } catch (error) {
    console.error('Error creating task deliverable status:', error);
    throw error;
  }
};

/**
 * Get all versions for a project
 * @param {number} projectId - The project ID
 * @returns {Promise<Array>} List of versions
 */
module.exports.getVersionsForProject = async (projectId) => {
  try {
    const versions = await prisma.version.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true, links: true }
        }
      }
    });
    
    return versions.map(v => ({
      versionId: v.versionId,
      projectId: v.projectId,
      name: v.name,
      description: v.description,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      taskCount: v._count.tasks,
      linkCount: v._count.links
    }));
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
};

/**
 * Create a new version with optional duplication from source version
 * @param {Object} versionData - Version data
 * @param {number} [sourceVersionId] - Optional source version ID to duplicate tasks from
 * @returns {Promise<Object>} Created version
 */
module.exports.createVersion = async (versionData, sourceVersionId = null) => {
  try {
    const { projectId, name, description, isActive } = versionData;

    // If this version should be active, deactivate all other versions
    if (isActive) {
      await prisma.version.updateMany({
        where: { projectId },
        data: { isActive: false }
      });
    }

    // Create the new version
    const version = await prisma.version.create({
      data: {
        projectId,
        name: name || 'Nouvelle version',
        description: description || null,
        isActive: isActive || false
      }
    });

    // If sourceVersionId is provided, duplicate all tasks from that version
    if (sourceVersionId) {
      await duplicateVersionTasks(sourceVersionId, version.versionId);
    }

    return {
      versionId: version.versionId,
      projectId: version.projectId,
      name: version.name,
      description: version.description,
      isActive: version.isActive,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    };
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
};

/**
 * Duplicate all tasks and related data from a source version to a target version
 * @param {number} sourceVersionId - Source version ID to duplicate from
 * @param {number} targetVersionId - Target version ID to duplicate to
 */
async function duplicateVersionTasks(sourceVersionId, targetVersionId) {
  try {
    // Fetch all tasks from the source version with all related data
    const sourceTasks = await prisma.task.findMany({
      where: { versionId: sourceVersionId },
      include: {
        taskAssignments: true,
        children: true,
        linksSource: true,
        linksTarget: true,
        expenses: true,
        assigneeDetails: true,
        deliverables: true
      }
    });

    if (sourceTasks.length === 0) {
      console.log('No tasks to duplicate from source version');
      return;
    }

    console.log(`Duplicating ${sourceTasks.length} tasks from version ${sourceVersionId} to ${targetVersionId}`);

    // Map to store old task ID to new task ID
    const taskIdMap = new Map();
    const newTasks = [];

    // First pass: create all tasks with the new versionId
    for (const task of sourceTasks) {
      const newTask = await prisma.task.create({
        data: {
          projectId: task.projectId,
          subActionId: task.subActionId,
          versionId: targetVersionId,
          name: task.name,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          progress: task.progress,
          parentId: null, // Will be updated in second pass
          type: task.type,
          details: task.details,
          notes: task.notes,
          files: task.files || [],
          goal: task.goal
        }
      });

      taskIdMap.set(task.taskId, newTask.taskId);
      newTasks.push({ ...newTask, originalTask: task });
    }

    // Second pass: update parent references and create related data
    for (const newTask of newTasks) {
      const originalTask = newTask.originalTask;

      // Update parent reference if exists
      if (originalTask.parentId && taskIdMap.has(originalTask.parentId)) {
        await prisma.task.update({
          where: { taskId: newTask.taskId },
          data: { parentId: taskIdMap.get(originalTask.parentId) }
        });
      }

      // Create task assignments
      if (originalTask.taskAssignments && originalTask.taskAssignments.length > 0) {
        await prisma.taskAssignment.createMany({
          data: originalTask.taskAssignments.map(ta => ({
            taskId: newTask.taskId,
            userId: ta.userId
          }))
        });
      }

      // Create task expenses
      if (originalTask.expenses && originalTask.expenses.length > 0) {
        await prisma.taskExpense.createMany({
          data: originalTask.expenses.map(e => ({
            taskId: newTask.taskId,
            category: e.category,
            amount: e.amount,
            date: e.date,
            description: e.description,
            vendor: e.vendor
          }))
        });
      }

      // Create assignee details
      if (originalTask.assigneeDetails && originalTask.assigneeDetails.length > 0) {
        await prisma.taskAssigneeDetail.createMany({
          data: originalTask.assigneeDetails.map(ad => ({
            taskId: newTask.taskId,
            userId: ad.userId,
            role: ad.role,
            allocation: ad.allocation
          }))
        });
      }

      // Create deliverables status
      if (originalTask.deliverables && originalTask.deliverables.length > 0) {
        await prisma.taskDeliverableStatus.createMany({
          data: originalTask.deliverables.map(d => ({
            taskId: newTask.taskId,
            name: d.name,
            status: d.status,
            completedAt: d.completedAt,
            notes: d.notes
          }))
        });
      }
    }

    // Third pass: create task links
    const sourceLinks = await prisma.taskLink.findMany({
      where: { versionId: sourceVersionId }
    });

    for (const link of sourceLinks) {
      const newSource = taskIdMap.get(link.source);
      const newTarget = taskIdMap.get(link.target);

      if (newSource && newTarget) {
        await prisma.taskLink.create({
          data: {
            source: newSource,
            target: newTarget,
            type: link.type,
            versionId: targetVersionId
          }
        });
      }
    }

    console.log(`Successfully duplicated ${sourceTasks.length} tasks and ${sourceLinks.length} links`);
  } catch (error) {
    console.error('Error duplicating version tasks:', error);
    throw error;
  }
}

/**
 * Update a version
 * @param {number} versionId - Version ID
 * @param {Object} versionData - Updated version data
 * @returns {Promise<Object>} Updated version
 */
module.exports.updateVersion = async (versionId, versionData) => {
  try {
    const { name, description, isActive } = versionData;

    const version = await prisma.version.update({
      where: { versionId },
      data: {
        name,
        description,
        isActive
      }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return {
      versionId: version.versionId,
      projectId: version.projectId,
      name: version.name,
      description: version.description,
      isActive: version.isActive,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    };
  } catch (error) {
    console.error('Error updating version:', error);
    throw error;
  }
};

/**
 * Delete a version
 * @param {number} versionId - Version ID
 * @returns {Promise<Object>} Deletion result
 */
module.exports.deleteVersion = async (versionId) => {
  try {
    // First, unlink tasks from this version
    await prisma.task.updateMany({
      where: { versionId },
      data: { versionId: null }
    });

    // Delete links associated with this version
    await prisma.taskLink.deleteMany({
      where: { versionId }
    });

    // Delete the version
    await prisma.version.delete({
      where: { versionId }
    });

    return { message: 'Version deleted successfully', versionId };
  } catch (error) {
    console.error('Error deleting version:', error);
    throw error;
  }
};

/**
 * Set a version as active (deactivates others)
 * @param {number} projectId - Project ID
 * @param {number} versionId - Version ID to activate
 * @returns {Promise<Object>} Updated version
 */
module.exports.setActiveVersion = async (projectId, versionId) => {
  try {
    // Deactivate all versions for this project
    await prisma.version.updateMany({
      where: { projectId },
      data: { isActive: false }
    });

    // Activate the specified version
    const version = await prisma.version.update({
      where: { versionId },
      data: { isActive: true }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return {
      versionId: version.versionId,
      projectId: version.projectId,
      name: version.name,
      description: version.description,
      isActive: version.isActive,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    };
  } catch (error) {
    console.error('Error activating version:', error);
    throw error;
  }
};
