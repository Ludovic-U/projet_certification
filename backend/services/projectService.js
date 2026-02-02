const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.createProject = async (data) => {
  try {
    const managerId = Number(data.projectManager ?? data.managerId ?? 1);
    const clientId = Number(data.clientId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      throw new Error(`createProject: invalid projectManager id (${data.projectManager})`);
    }
    if (!Number.isInteger(clientId) || clientId <= 0) {
      throw new Error(`createProject: invalid clientId (${data.clientId})`);
    }

    const newProject = await prisma.project.create({
      data: {
        projectName: data.projectName,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        projectStage: data.projectStage ?? "Idéation",
        projectStatus: data.projectStatus ?? "en cours",
        projectDesc: data.projectDesc ?? null,
        manager: { connect: { userId: managerId } },
        client: { connect: { clientId: clientId } },
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

    return newProject;
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    throw new Error("Impossible de créer le projet.");
  }
};

module.exports.getAllProjects = async () => {
  // never used
};

module.exports.deleteProject = async (projectId) => {
  try {
    return await prisma.project.delete({
      where: { projectId: projectId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Project not found");
    }
    throw error;
  }
};

module.exports.getProjectById = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { projectId: projectId },
    include: { 
      types: true, 
      questions: true,
      tasks: {
        include: {
          taskFiles: true,
          taskDepenses: true,
          taskEmployee: true,
          children: true,
          parent: true
        }
      }
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

module.exports.ProjectsByClientId = async (clientId) => {
  try {
    const validClientId = Number(clientId);
    if (!Number.isInteger(validClientId) || validClientId <= 0) {
      throw new Error("Invalid clientId");
    }

    const projects = await prisma.project.findMany({
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
        FinanceurProjet: {
          include: {
            financeur: {
              select: {
                FinanceurName: true,
              },
            },
          },
        },
        // ADDED: Include tasks with their relations
        tasks: {
          include: {
            taskFiles: true,
            taskDepenses: true,
            taskEmployee: true,
            children: true,
            parent: true
          },
          orderBy: {
            taskStart: 'asc'
          }
        },
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Format projects for Gantt chart
    const formattedProjects = projects.map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
      clientId: project.client.clientId,
      clientName: project.client.clientName,
      ChefDeProjet: project.manager 
        ? `${project.manager.firstname} ${project.manager.lastname}` 
        : "N/A",
      types: project.types.map((t) => t.label),
      financeurs: project.FinanceurProjet.map((fp) => fp.financeur.FinanceurName),
      // Project data for Gantt
      startDate: project.startDate,
      endDate: project.endDate,
      projectStage: project.projectStage,
      projectProgress: project.projectProgress || 0,
      createdAt: project.createdAt,
      // Include tasks for Gantt
      tasks: project.tasks.map(task => ({
        taskId: task.taskId,
        taskName: task.taskName,
        taskStart: task.taskStart,
        taskEnd: task.taskEnd,
        taskProgress: task.taskProgress || 0,
        taskDesc: task.taskDesc || '',
        taskParentId: task.taskParentId || 0,
        parentId: task.parentId || 0,
        projectId: task.projectId,
        taskType: task.taskType || 'task',
        // Include nested data if needed
        files: task.taskFiles,
        expenses: task.taskDepenses,
        employees: task.taskEmployee,
        children: task.children,
        parent: task.parent
      }))
    }));

    return formattedProjects;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets :", error);
    throw error;
  }
}

// SWOT Functions
module.exports.updateProjectSwot = async (projectId, swotData) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const updateData = {};
    if (swotData.SWOT_strength !== undefined) updateData.SWOT_strength = swotData.SWOT_strength;
    if (swotData.SWOT_weakness !== undefined) updateData.SWOT_weakness = swotData.SWOT_weakness;
    if (swotData.SWOT_opportunity !== undefined) updateData.SWOT_opportunity = swotData.SWOT_opportunity;
    if (swotData.SWOT_threat !== undefined) updateData.SWOT_threat = swotData.SWOT_threat;

    const updatedProject = await prisma.project.update({
      where: { projectId: validProjectId },
      data: updateData,
      select: {
        projectId: true,
        projectName: true,
        SWOT_strength: true,
        SWOT_weakness: true,
        SWOT_opportunity: true,
        SWOT_threat: true,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error("Erreur lors de la mise à jour SWOT :", error);
    throw error;
  }
};

module.exports.getProjectSwot = async (projectId) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const project = await prisma.project.findUnique({
      where: { projectId: validProjectId },
      select: {
        projectId: true,
        projectName: true,
        SWOT_strength: true,
        SWOT_weakness: true,
        SWOT_opportunity: true,
        SWOT_threat: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  } catch (error) {
    console.error("Erreur lors de la récupération SWOT :", error);
    throw error;
  }
};
