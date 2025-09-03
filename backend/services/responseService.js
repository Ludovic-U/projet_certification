const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

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
  await checkIdExistence(prisma.response, responseId, "Response not found");
  return await prisma.response.update({
    where: { responseId: responseId },
    data,
  });
};

/**
 * Delete a response by ID.
 * @param {number} responseId - The ID of the response to delete.
 * @returns {Promise<Object>} The deleted response.
 * @throws {Error} If the response does not exist.
 */
module.exports.deleteResponse = async (responseId) => {
  await checkIdExistence(prisma.response, responseId, "Response not found");
  return await prisma.response.delete({
    where: { responseId: responseId },
  });
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
  return await prisma.response.findMany({
    where: { projectId: projectId, questionId: questionId },
  });
};

/**
 * Get responses by project.
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array>} List of responses.
 * @throws {Error} If project does not exist.
 */
module.exports.getResponsesByProject = async (projectId) => {
  await checkIdExistence(prisma.response, projectId, "Project not found");
  return await prisma.response.findMany({
    where: { projectId: projectId },
  });
};

/**
 * Get subReponses by parent response ID.
 * @param {number} responseIdParent - The parent response ID.
 * @returns {Promise<Array>} List of subresponses.
 */
module.exports.getSubResponses = async (responseIdParent) => {
  return await prisma.response.findMany({
    where: { responseIdParent: responseIdParent },
  });
};
