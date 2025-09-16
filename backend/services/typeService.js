const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new type.
 *
 * @async
 * @function createType
 * @param {Object} data - The type data to create.
 * @param {string} data.label - The type name.
 * @param {Array<number>} [data.questions] - question IDs to associate.
 * @param {Array<number>} [data.projects] - project IDs to associate.
 * @returns {Promise<Object>} The created type, including related questions and projects.
 */
module.exports.createType = async (data) => {
  const { questions, projects, ...typeData } = data;

  return await prisma.type.create({
    data: {
      ...typeData,
      questions:
        Array.isArray(questions) && questions.length > 0
          ? {
              connect: questions.map((questionId) => ({ questionId })),
            }
          : undefined,
      projects:
        Array.isArray(projects) && projects.length > 0
          ? {
              connect: projects.map((projectId) => ({ projectId })),
            }
          : undefined,
    },
    include: { questions: true, projects: true },
  });
};

/**
 * Get all types.
 *
 * @async
 * @function getAllTypes
 * @returns {Promise<Array<Object>>} List of all types.
 */
module.exports.getAllTypes = async () => {
  return await prisma.type.findMany({});
};

/**
 * Update a type by ID.
 *
 * @async
 * @function updateType
 * @param {number} typeId - The ID of the type to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.label] - Updated type name.
 * @param {Array<number>} [data.addQuestion] - Question IDs to connect.
 * @param {Array<number>} [data.removeQuestion] - Question IDs to disconnect.
 * @param {Array<number>} [data.addProject] - Project IDs to connect.
 * @param {Array<number>} [data.removeProject] - Project IDs to disconnect.
 * @returns {Promise<Object>} The updated type, including related questions and projects.
 * @throws {Error} If the type does not exist.
 */
module.exports.updateType = async (typeId, data) => {
  const { addQuestion, removeQuestion, addProject, removeProject, typeData } =
    data;

  try {
    return await prisma.type.update({
      where: { typeId: typeId },
      data: {
        ...typeData,
        // Add / Remove questions
        questions:
          (Array.isArray(addQuestion) && addQuestion.length > 0) ||
          (Array.isArray(removeQuestion) && removeQuestion.length > 0)
            ? {
                connect:
                  Array.isArray(addQuestion) && addQuestion.length > 0
                    ? addQuestion.map((questionId) => ({ questionId }))
                    : undefined,
                disconnect:
                  Array.isArray(removeQuestion) && removeQuestion.length > 0
                    ? removeQuestion.map((questionId) => ({ questionId }))
                    : undefined,
              }
            : undefined,
        // Add / Remove projects
        projects:
          (Array.isArray(addProject) && addProject.length > 0) ||
          (Array.isArray(removeProject) && removeProject.length > 0)
            ? {
                connect:
                  Array.isArray(addProject) && addProject.length > 0
                    ? addProject.map((projectId) => ({ projectId }))
                    : undefined,
                disconnect:
                  Array.isArray(removeProject) && removeProject.length > 0
                    ? removeProject.map((projectId) => ({ projectId }))
                    : undefined,
              }
            : undefined,
      },
      include: { questions: true, projects: true },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Type not found");
    }
    throw error;
  }
};

/**
 * Delete a question by ID.
 *
 * @async
 * @function deleteType
 * @param {number} typeId - The ID of the type to delete.
 * @returns {Promise<Object>} The deleted type.
 * @throws {Error} If the type does not exist.
 */
module.exports.deleteType = async (typeId) => {
  try {
    return await prisma.type.delete({
      where: { typeId: typeId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Type not found");
    }
    throw error;
  }
};

/**
 * Get a type by ID.
 *
 * @async
 * @function getTypeById
 * @param {number} typeId - The ID of the type to retrieve.
 * @returns {Promise<Object>} The found type, including questions and projects.
 * @throws {Error} If the type does not exist.
 */
module.exports.getTypeById = async (typeId) => {
  const type = await prisma.type.findUnique({
    where: { typeId: typeId },
    include: { questions: true, projects: true },
  });

  if (!type) {
    throw new Error("Type not found");
  }

  return type;
};
