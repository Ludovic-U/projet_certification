const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new response.
 * @param {Object} data - The response data to create.
 * @returns {Promise<Oject>} The created response.
 */
module.exports.createResponse = async (data) => {
  return await prisma.response.create({ data });
};

/**
 * Update a response by ID.
 * @param {number} responseId - The ID of the response to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} THe updated response.
 * @throws {Error} If the response does not exist
 */
module.exports.updateResponse = async (responseId, data) => {
  try {
    return await prisma.response.update({
      where: { responseId: responseId },
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Response not found");
    }
    throw error;
  }
};

/**
 * Delete a response by ID.
 * @param {number} responseId - The ID of the response to delete.
 * @returns {Promise<Object>} The deleted response.
 * @throws {Error} If the response does not exist.
 */
module.exports.deleteResponse = async (responseId) => {
  try {
    return await prisma.response.delete({
      where: { responseId: responseId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Response not found");
    }
    throw error;
  }
};

/**
 * Get responses by question of a project.
 * @param {number} projectId - The project ID.
 * @param {number} questionId - The Question ID.
 * @returns {Promise<Array>} List of responses.
 */
module.exports.getResponsesByQuestionOfProject = async (
  projectId,
  questionId
) => {
  const projectWithQuestions = await prisma.response.findMany({
    where: { projectId: projectId, questionId: questionId },
  });

  return projectWithQuestions;
};

/**
 * Get responses by project.
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array>} List of responses.
 * @throws {Error} If project does not exist.
 */
module.exports.getResponsesByProject = async (projectId) => {
  const projectWithResponses = await prisma.project.findUnique({
    where: { projectId: projectId },
    include: { responses: true },
  });

  if (!projectWithResponses) {
    throw new Error("Project not found");
  }

  return projectWithResponses.responses;
};

/**
 * Get subReponses by parent response ID.
 * @param {number} responseIdParent - The parent response ID.
 * @returns {Promise<Array>} List of subresponses.
 */
module.exports.getSubResponses = async (responseIdParent) => {
  const responseParent = await prisma.response.findUnique({
    where: { responseId: responseIdParent },
    include: { children: true },
  });

  if (!responseParent) {
    throw new Error("ResponseParent not found");
  }

  return responseParent.children;
};
