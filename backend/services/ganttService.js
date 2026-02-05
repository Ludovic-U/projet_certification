const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all tasks for a project with all related data
 * @param {number} projectId - The project ID
 * @returns {Promise<Object>} Gantt data object with tasks, links, users, livrables
 */
module.exports.getGanttData = async (projectId) => {
  try {
    // Get all tasks directly associated with this project OR via subAction->action OR truly orphaned tasks
    // "Truly orphaned" means: no project_id, no sub_action_id, AND no parent
    const projectTasks = await prisma.task.findMany({
      where: {
        OR: [
          { projectId: projectId },
          {
            subAction: {
              action: {
                projectId: projectId
              }
            }
          },
          // Include only truly orphaned tasks (no project association AND no parent)
          {
            AND: [
              { projectId: null },
              { subActionId: null },
              { parentId: null }
            ]
          }
        ]
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
        livrables: {
          include: {
            livrable: true
          }
        }
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
        livrables: {
          include: {
            livrable: true
          }
        }
      }
    });

    // Build task map
    const taskMap = new Map();
    allTasks.forEach(task => {
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
        livrableIds: task.livrables.map(tl => tl.livrableId),
        goal: task.goal,
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

    // Create the task with projectId
    const task = await prisma.task.create({
      data: {
        projectId: projectId || null,
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
      await prisma.taskLivrable.createMany({
        data: livrableIds.map(livrableId => ({
          taskId: task.taskId,
          livrableId: Number(livrableId)
        }))
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
        livrables: true
      }
    });

    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Update the task
    const updateData = {};
    if (projectId !== undefined) updateData.projectId = projectId;
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
      // Remove old relations
      await prisma.taskLivrable.deleteMany({
        where: { taskId }
      });
      // Add new relations
      if (livrableIds.length > 0) {
        await prisma.taskLivrable.createMany({
          data: livrableIds.map(livrableId => ({ taskId, livrableId }))
        });
      }
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
      livrableIds: livrableIds !== undefined ? livrableIds : currentTask.livrables.map(tl => tl.livrableId),
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
  await tx.taskLivrable.deleteMany({ where: { taskId } });
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
