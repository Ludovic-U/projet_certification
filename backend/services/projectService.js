const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const todoService = require('./todoService');

module.exports.createProject = async (data) => {
  try {
    const projectManagerValue = data.projectManager ?? data.managerId;
    const managerId = Number.isNaN(Number(projectManagerValue)) ? 1 : Number(projectManagerValue);
    const clientId = Number(data.clientId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      throw new Error(`createProject: invalid projectManager id (${data.projectManager})`);
    }
    if (!Number.isInteger(clientId) || clientId <= 0) {
      throw new Error(`createProject: invalid clientId (${data.clientId})`);
    }

    // Handle types: connect existing ones by ID and create new ones by label
    let typesConnect = [];
    let typesCreate = [];
    
    if (Array.isArray(data.types) && data.types.length > 0) {
      typesConnect = data.types
        .filter(id => id && !isNaN(Number(id)))
        .map(id => ({ typeId: Number(id) }));
    }
    
    if (Array.isArray(data.newTypes) && data.newTypes.length > 0) {
      // Create new types with unique labels
      typesCreate = data.newTypes
        .filter(label => label && typeof label === 'string' && label.trim())
        .map(label => ({
          label: label.trim(),
        }));
    }
    
    // Build the types relation object
    const typesRelation = {};
    if (typesConnect.length > 0) {
      typesRelation.connect = typesConnect;
    }
    if (typesCreate.length > 0) {
      typesRelation.create = typesCreate;
    }
    const typesData = Object.keys(typesRelation).length > 0 ? typesRelation : undefined;

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
        types: typesData,
      },
      include: {
        manager: true,
        client: true,
        types: true,
        questions: true,
      },
    });

    // Créer la tâche todo initiale
    try {
      await todoService.createTodo({
        text: 'Compléter la partie "Analyse stratégique" dans Idéation',
        projectId: newProject.projectId,
        assignedTo: managerId,
      });
    } catch (todoError) {
      console.error("Erreur lors de la création de la todo initiale :", todoError);
      // Ne pas bloquer la création du projet si la todo échoue
    }

    return newProject;
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    throw new Error("Impossible de créer le projet.");
  }
};

module.exports.getAllProjects = async () => {
  // never used
};

module.exports.getProjectsByUserId = async (userId) => {
  try {
    const validUserId = Number(userId);
    if (!Number.isInteger(validUserId) || validUserId <= 0) {
      throw new Error("Invalid userId: " + userId);
    }

    console.log('Fetching projects for userId:', validUserId);

    // Get projects where user is:
    // 1. Manager of the project
    // 2. Assigned to tasks in the project
    // 3. Client manager (isManager: true in clientUserRoles)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { projectManager: validUserId },
          {
            tasks: {
              some: {
                taskAssignments: {
                  some: { userId: validUserId }
                }
              }
            }
          },
          {
            client: {
              userRoles: {
                some: { userId: validUserId, isManager: true }
              }
            }
          }
        ]
      },
      include: {
        client: {
          select: {
            clientId: true,
            clientName: true,
          },
        },
        manager: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        projectName: 'asc'
      }
    });

    console.log('Found projects:', projects.length);

    // Format the response
    const formattedProjects = projects.map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
      clientId: project.client.clientId,
      clientName: project.client.clientName,
      managerName: project.manager 
        ? `${project.manager.firstname} ${project.manager.lastname}` 
        : "N/A",
    }));

    return formattedProjects;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets par utilisateur :", error.message);
    console.error(error.stack);
    throw error;
  }
};

module.exports.updateProject = async (projectId, data) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const updateData = {};

    if (data.projectName !== undefined) updateData.projectName = data.projectName;
    if (data.projectDesc !== undefined) updateData.projectDesc = data.projectDesc;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.projectStage !== undefined) updateData.projectStage = data.projectStage;
    if (data.projectStatus !== undefined) updateData.projectStatus = data.projectStatus;

    if (data.projectManager !== undefined && data.projectManager !== null) {
      const managerId = Number(data.projectManager);
      if (!Number.isInteger(managerId) || managerId <= 0) {
        throw new Error(`updateProject: invalid projectManager id (${data.projectManager})`);
      }
      updateData.manager = { connect: { userId: managerId } };
    }

    if (Array.isArray(data.types)) {
      updateData.types = {
        set: data.types.map((id) => ({ typeId: Number(id) })),
      };
    }

    const updatedProject = await prisma.project.update({
      where: { projectId: validProjectId },
      data: updateData,
      include: {
        manager: true,
        client: true,
        types: true,
        questions: true,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet :", error);
    if (error.code === "P2025") {
      throw new Error("Project not found");
    }
    throw error;
  }
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
    include: { types: true, questions: true },
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
            userId: true,
            firstname: true,
            lastname: true,
          },
        },
        types: {
          select: {
            typeId: true,
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
      },
    });

    // Transformer les données pour correspondre au type Project frontend
    const formattedProjects = projects.map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
      goNogo: project.goNogo ?? null,
      projectManager: project.projectManager,
      projectDesc: project.projectDesc,
      startDate: project.startDate,
      clientId: project.client.clientId,
      clientName: project.client.clientName,
      ChefDeProjet: project.manager 
        ? `${project.manager.firstname} ${project.manager.lastname}` 
        : "N/A",
      types: project.types.map((t) => t.label), // Array de strings
      typeIds: project.types.map((t) => t.typeId), // Array de numbers
      financeurs: project.FinanceurProjet.map((fp) => fp.financeur.FinanceurName), // Array de strings
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

module.exports.updateProjectGoNogo = async (projectId, goNogo) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const updatedProject = await prisma.project.update({
      where: { projectId: validProjectId },
      data: { goNogo },
      select: {
        projectId: true,
        projectName: true,
        goNogo: true,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error("Erreur lors de la mise à jour go/nogo :", error);
    throw error;
  }
};

// Get all feasibility decisions for a project
module.exports.getProjectDecisions = async (projectId) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    // First verify the project exists
    const project = await prisma.project.findUnique({
      where: { projectId: validProjectId },
      select: { projectId: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get all decisions for the project
    const decisions = await prisma.projectDecision.findMany({
      where: { projectId: validProjectId },
      orderBy: [
        { boardType: 'asc' },
        { decisionType: 'asc' }
      ],
    });

    return decisions;
  } catch (error) {
    console.error("Erreur lors de la récupération des décisions :", error);
    throw error;
  }
};

// Update or create a feasibility decision
module.exports.updateProjectDecision = async (projectId, data) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const { feasibilityType, boardType, decisionType, isApproved, pourquoi, decisionFinale } = data;

    // First verify the project exists
    const project = await prisma.project.findUnique({
      where: { projectId: validProjectId },
      select: { projectId: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Determine board type and decision type
    const board = boardType || "faisabilite";
    const decision = decisionType || feasibilityType;

    // Decision data to upsert
    const decisionData = {};
    
    if (isApproved !== undefined) {
      decisionData.isApproved = isApproved ?? null;
    }
    if (pourquoi !== undefined) {
      decisionData.pourquoi = pourquoi ?? null;
    }
    if (decisionFinale !== undefined) {
      // Validate decisionFinale
      const validFinales = ["go", "nogo", "pending", null];
      if (!validFinales.includes(decisionFinale)) {
        throw new Error("decisionFinale must be 'go', 'nogo', 'pending', or null");
      }
      decisionData.decisionFinale = decisionFinale;
    }

    const upsertedDecision = await prisma.projectDecision.upsert({
      where: {
        projectId_boardType_decisionType: {
          projectId: validProjectId,
          boardType: board,
          decisionType: decision,
        },
      },
      update: decisionData,
      create: {
        projectId: validProjectId,
        boardType: board,
        decisionType: decision,
        ...decisionData,
      },
    });

    return upsertedDecision;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la décision :", error);
    throw error;
  }
};

// Get all impacts for a project
module.exports.getProjectImpacts = async (projectId) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    // First verify the project exists
    const project = await prisma.project.findUnique({
      where: { projectId: validProjectId },
      select: { projectId: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Get all impacts for the project, ordered by rowOrder
    const impacts = await prisma.projectImpact.findMany({
      where: { projectId: validProjectId },
      orderBy: { rowOrder: 'asc' },
    });

    return impacts;
  } catch (error) {
    console.error("Erreur lors de la récupération des impacts :", error);
    throw error;
  }
};

// Update or create an impact row
module.exports.updateProjectImpact = async (projectId, data) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    // First verify the project exists
    const project = await prisma.project.findUnique({
      where: { projectId: validProjectId },
      select: { projectId: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const { id, rowOrder, resultatsAttendus, criteres, indicateurs, situationDepart, objectif } = data;

    // If id is provided, update existing; otherwise create new
    if (id) {
      // Update existing impact
      const updatedImpact = await prisma.projectImpact.update({
        where: { impactId: id, projectId: validProjectId },
        data: {
          rowOrder: rowOrder ?? 0,
          resultatsAttendus: resultatsAttendus ?? null,
          criteres: criteres ?? null,
          indicateurs: indicateurs ?? null,
          situationDepart: situationDepart ?? null,
          objectif: objectif ?? null,
        },
      });
      return updatedImpact;
    } else {
      // Get max rowOrder to append at the end
      const maxOrderImpact = await prisma.projectImpact.findFirst({
        where: { projectId: validProjectId },
        orderBy: { rowOrder: 'desc' },
        select: { rowOrder: true },
      });

      const newRowOrder = maxOrderImpact ? maxOrderImpact.rowOrder + 1 : 0;

      // Create new impact
      const newImpact = await prisma.projectImpact.create({
        data: {
          projectId: validProjectId,
          rowOrder: rowOrder ?? newRowOrder,
          resultatsAttendus: resultatsAttendus ?? "",
          criteres: criteres ?? "",
          indicateurs: indicateurs ?? "",
          situationDepart: situationDepart ?? "",
          objectif: objectif ?? "",
        },
      });
      return newImpact;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'impact :", error);
    throw error;
  }
};

// Delete an impact row
module.exports.deleteProjectImpact = async (projectId, impactId) => {
  try {
    const validProjectId = Number(projectId);
    const validImpactId = Number(impactId);

    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }
    if (!Number.isInteger(validImpactId) || validImpactId <= 0) {
      throw new Error("Invalid impactId");
    }

    // Verify the impact exists and belongs to the project
    const impact = await prisma.projectImpact.findFirst({
      where: { impactId: validImpactId, projectId: validProjectId },
    });

    if (!impact) {
      throw new Error("Impact not found");
    }

    // Delete the impact
    await prisma.projectImpact.delete({
      where: { impactId: validImpactId },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'impact :", error);
    throw error;
  }
};
