// Made a simple projectService
// TODO: Added missing methods

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
  //TODO: check permissions
  try {
    const newProject = await prisma.project.create({
      data: {
        projectName: data.projectName,
        startDate: new Date(),
        endDate: null,
        projectManager: data.projectManager,
        projectStage: "Idéation",
        projectStatus: "en cours",
        projectDesc: data.projectDesc,
        clientId: data.clientId,
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
