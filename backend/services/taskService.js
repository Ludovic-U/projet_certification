const { PrismaClient } = require('@prisma/client');
const { PrismaTask } = require('@prisma/task');
const prisma = new PrismaClient();
const task = new PrismaTask();

module.exports.createTask = async (data) => {
  try {
    const managerId = Number(data.projectManager ?? data.managerId ?? 1); // adapter si nécessaire
    const clientId = Number(data.clientId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      throw new Error(`createTask: invalid projectManager id (${data.projectManager})`);
    }
    if (!Number.isInteger(clientId) || clientId <= 0) {
      throw new Error(`createTask: invalid clientId (${data.clientId})`);
    }

    const newtask = await prisma.task.create({
      data: {
        taskName: data.taskName,
        startDate: data.startDate ? new Date(data.taskStart) : new Date(),
        endDate: data.endDate ? new Date(data.taskEnd) : null,
        taskProgress: data.taskProgress ?? `en cours (${data.taskProgress})`,
        taskDesc: data.taskDesc ?? null,
        // connect relations via nested connect (do not include the scalar fields projectManager/clientId here)
        manager: { connect: { userId: managerId } },
        client: { connect: { clientId: clientId } },
        // Connecter les types si fournis
        types: Array.isArray(data.types) && data.types.length > 0 
          ? { connect: data.types.map(id => ({ typeId: Number(id) })) } 
          : undefined,
      },
      include: {
        manager: true,
        client: true,
        types: true,
        questions: true,
      },
    });

    return newTask;
  } catch (error) {
    console.error("Erreur lors de la création de la tâche :", error);
    throw new Error("Impossible de créer la tâche.");
  }
};

module.exports.getAllTask = async () => {
  // never used
};

// TODO: Update

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
    include: { types: true, questions: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
};

module.exports.TaskByClientId = async (clientId) => {
  try {
    const validClientId = Number(clientId);
    if (!Number.isInteger(validClientId) || validClientId <= 0) {
      throw new Error("Invalid clientId");
    }

    const task = await prisma.task.findMany({
      where: { clientId: validClientId },
      include: {
        client: {
          select: {
            clientId: true,
            clientName: true,
          },
        },
        manager: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        types: {
          select: {
            label: true,
          },
        },
           },
          },
        },
      },
    });

    // Transformer les données pour correspondre au type task frontend
    const formattedtasks = tasks.map((task) => ({
      taskId: task.taskId,
      taskName: task.taskName,
      clientId: task.client.clientId,
      clientName: task.client.clientName,
      ChefDeProjet: task.manager 
        ? `${project.manager.firstname} ${project.manager.lastname}` 
        : "N/A",
      types: task.types.map((t) => t.label), // Array de strings
      financeurs: task.FinanceurProjet.map((fp) => fp.financeur.FinanceurName), // Array de strings
    }));

    return formattedtasks;
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches :", error);
    throw error;
  }
}

// SWOT Functions
module.exports.updatetaskSwot = async (taskId, swotData) => {
  try {
    const validTaskId = Number(TaskId);
    if (!Number.isInteger(validTaskId) || validTaskId <= 0) {
      throw new Error("Invalid taskId");
    }

    const updateData = {};
    if (swotData.SWOT_strength !== undefined) updateData.SWOT_strength = swotData.SWOT_strength;
    if (swotData.SWOT_weakness !== undefined) updateData.SWOT_weakness = swotData.SWOT_weakness;
    if (swotData.SWOT_opportunity !== undefined) updateData.SWOT_opportunity = swotData.SWOT_opportunity;
    if (swotData.SWOT_threat !== undefined) updateData.SWOT_threat = swotData.SWOT_threat;

    const updatedTask = await prisma.task.update({
      where: { taskId: validTaskId },
      data: updateData,
      select: {
        taskId: true,
        taskName: true,
        SWOT_strength: true,
        SWOT_weakness: true,
        SWOT_opportunity: true,
        SWOT_threat: true,
      },
    });

    return updatedTask;
  } catch (error) {
    console.error("Erreur lors de la mise à jour SWOT :", error);
    throw error;
  }
};

module.exports.gettaskSwot = async (taskId) => {
  try {
    const validTaskId = Number(taskId);
    if (!Number.isInteger(validtaskId) || validtaskId <= 0) {
      throw new Error("Invalid taskId");
    }

    const task = await prisma.task.findUnique({
      where: { taskId: validtaskId },
      select: {
        taskId: true,
        taskName: true,
        SWOT_strength: true,
        SWOT_weakness: true,
        SWOT_opportunity: true,
        SWOT_threat: true,
      },
    });

    if (!task) {
      throw new Error("task not found");
    }

    return task;
  } catch (error) {
    console.error("Erreur lors de la récupération SWOT :", error);
    throw error;
  }
}
