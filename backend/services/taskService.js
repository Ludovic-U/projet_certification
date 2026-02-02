const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.createTask = async (data) => {
  try {
    // Note: Your schema doesn't have a manager field on Task
    // Task is connected to Project, not directly to User
    const newTask = await prisma.task.create({
      data: {
        taskName: data.taskName,
        taskStart: data.startDate ? new Date(data.startDate) : new Date(),
        taskEnd: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days from now
        taskProgress: data.taskProgress || 0,
        taskDesc: data.taskDesc || null,
        taskParentId: data.taskParentId || 0,
        projectId: Number(data.projectId),
        taskType: data.taskType || 'task',
      },
    });

    return newTask;
  } catch (error) {
    console.error("Erreur lors de la création de la tâche :", error);
    throw new Error("Impossible de créer la tâche.");
  }
};

module.exports.getAllTasks = async () => {
  try {
    return await prisma.task.findMany({
      include: {
        taskProject: true,
        taskFiles: true,
        taskDepenses: true,
        taskEmployee: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches :", error);
    throw error;
  }
};

module.exports.deleteTask = async (taskId) => {
  try {
    return await prisma.task.delete({
      where: { taskId: taskId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Task not found");
    }
    throw error;
  }
};

module.exports.getTaskById = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { taskId: taskId },
    include: { 
      taskProject: true,
      taskFiles: true,
      taskDepenses: true,
      taskEmployee: true,
      children: true,
      parent: true
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
};

module.exports.TasksByClientId = async (clientId) => {
  try {
    const validClientId = Number(clientId);
    if (!Number.isInteger(validClientId) || validClientId <= 0) {
      throw new Error("Invalid clientId");
    }

    // Get tasks through projects
    const projects = await prisma.project.findMany({
      where: { clientId: validClientId },
      include: {
        tasks: {
          include: {
            taskFiles: true,
            taskDepenses: true,
            taskEmployee: true,
            children: true,
            parent: true
          }
        },
        client: {
          select: {
            clientId: true,
            clientName: true,
          },
        }
      },
    });

    // Flatten tasks from all projects
    const allTasks = projects.flatMap(project => 
      project.tasks.map(task => ({
        ...task,
        clientId: project.client.clientId,
        clientName: project.client.clientName,
        projectName: project.projectName
      }))
    );

    return allTasks;
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches :", error);
    throw error;
  }
}

// SWOT Functions - Note: Your Task model doesn't have SWOT fields
// You might need to add them to your schema first
module.exports.updateTaskSwot = async (taskId, swotData) => {
  try {
    const validTaskId = Number(taskId);
    if (!Number.isInteger(validTaskId) || validTaskId <= 0) {
      throw new Error("Invalid taskId");
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { taskId: validTaskId }
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Note: Your Task model doesn't have SWOT fields
    // You would need to add them to your Prisma schema first
    // For now, we'll just update basic task info
    const updateData = {};
    if (swotData.taskProgress !== undefined) updateData.taskProgress = swotData.taskProgress;
    if (swotData.taskDesc !== undefined) updateData.taskDesc = swotData.taskDesc;

    const updatedTask = await prisma.task.update({
      where: { taskId: validTaskId },
      data: updateData,
    });

    return updatedTask;
  } catch (error) {
    console.error("Erreur lors de la mise à jour SWOT :", error);
    throw error;
  }
};

module.exports.getTaskSwot = async (taskId) => {
  try {
    const validTaskId = Number(taskId);
    if (!Number.isInteger(validTaskId) || validTaskId <= 0) {
      throw new Error("Invalid taskId");
    }

    const task = await prisma.task.findUnique({
      where: { taskId: validTaskId },
      select: {
        taskId: true,
        taskName: true,
        taskDesc: true,
        taskProgress: true,
        // Note: Add SWOT fields to your schema if needed
        // SWOT_strength: true,
        // SWOT_weakness: true,
        // SWOT_opportunity: true,
        // SWOT_threat: true,
      },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  } catch (error) {
    console.error("Erreur lors de la récupération SWOT :", error);
    throw error;
  }
}
