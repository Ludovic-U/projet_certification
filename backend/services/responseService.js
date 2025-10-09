const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new response.
 *
 * @async
 * @function createResponse
 * @param {Object} data - The response data to create.
 * @param {string} data.label - The response text.
 * @param {string} data.projectId - The ID of the associated project.
 * @param {number} data.questionId - The ID of the associated question.
 * @param {number|null} [data.optionId=null] - The ID of the associated option.
 * @param {number"null} [data.responseIdParent=null] - Parent response ID if this is a sub-response.
 * @returns {Promise<Object>} The created response.
 */
module.exports.createResponse = async (data) => {
  return await prisma.response.create({ data });
};

/**
 * Update a response by ID.
 *
 * @async
 * @function updateResponse
 * @param {number} responseId - The ID of the response to update.
 * @param {Object} data - The fields to update.
 * @param {string} data.label - Updated repsonse text.
 * @param {string} data.projectId - Updated the associated project ID.
 * @param {number} data.questionId - Updated the associated question ID.
 * @param {number} data.optionId - Updated the associated option ID.
 * @param {number} data.responseIdParent - Updated parent repsonse ID.
 * @returns {Promise<Object>} The updated response.
 * @throws {Error} If the response does not exist.
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
 *
 * @async
 * @function deleteResponse
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
 * Get responses by question ID of project ID.
 *
 * @async
 * @function getResponsesByQuestionOfProject
 * @param {number} projectId -The ID of the project to retrieve.
 * @param {number} questionId - The ID of the question to retrieve.
 * @returns {Promise<Array<Object>>} List of response for the question of a project.
 * @throws {Error} If the project or question does not exist.
 */
module.exports.getResponsesByQuestionOfProject = async (
  projectId,
  questionId
) => {
  const project = await prisma.project.findUnique({
    where: { projectId: projectId },
    select: {
      questions: {
        where: { questionId: questionId },
        select: { responses: { include: { children: true } } },
      },
      // types: {
      //   select: {
      //     questions: {
      //       where: { questionId: questionId },
      //       select: { responses: { include: { children: true } } },
      //     },
      //   },
      // },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const question = project.questions[0]; //|| project.types.flatMap((t) => t.questions)[0];

  if (!question) {
    throw new Error("Question not found");
  }

  return question.responses;
};

/**
 * Get all responses related to a specific project.
 *
 * @async
 * @function getResponsesByProject
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array<Object>>} List of responses for the project.
 * @throws {Error} If the project does not exist.
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
 * Get all subresponses for a parent response.
 *
 * @async
 * @function getSubResponses
 * @param {number} responseIdParent - The parent response ID.
 * @returns {Promise<Array<Object>>} List of subresponses.
 * @throws {Error} If the parent response does not exist.
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
