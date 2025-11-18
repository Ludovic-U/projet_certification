const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// module.exports.createProject = async (data) => {
//   const { types, questions, ...projectData } = data;

//   return await prisma.project.create({
//     data: {
//       ...projectData,
//       types:
//         Array.isArray(types) && types.length > 0
//           ? {
//               connect: types.map((typeId) => ({ typeId })),
//             }
//           : undefined,

//       questions:
//         Array.isArray(questions) && questions.length > 0
//           ? {
//               connect: questions.map((questionId) => ({ questionId })),
//             }
//           : undefined,
//     },
//     include: {
//       types: true,
//       questions: true,
//     },
//   });
// };

module.exports.createProject = async (data) => {
  // TODO: check permissions
  try {
    const managerId = Number(data.projectManager ?? data.managerId ?? 1); // adapter si nécessaire
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
        // connect relations via nested connect (do not include the scalar fields projectManager/clientId here)
        manager: { connect: { userId: managerId } },
        client: { connect: { clientId: clientId } },
        // si tu as types/questions à connecter :
        // types: Array.isArray(data.types) && data.types.length > 0 ? { connect: data.types.map(id => ({ typeId: id })) } : undefined,
        // questions: Array.isArray(data.questions) && data.questions.length > 0 ? { connect: data.questions.map(id => ({ questionId: id })) } : undefined,
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
  return await prisma.project.findMany();
};

// TODO: Update

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
  //TODO: validate clientId
  //TODO: authorisation
  return await prisma.project.findMany({
    where: { clientId: clientId },
    include: { types: true, questions: true },
  });
}
