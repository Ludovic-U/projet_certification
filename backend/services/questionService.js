const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new question.
 * @param {Object} data - The question data to create.
 * @returns {Promise<Object>} The created question.
 */
module.exports.createQuestion = async (data) => {
  return await prisma.question.create({ data });
};

/**
 * Get all questions.
 * @returns {Promise<Array>} List of all questions.
 */
module.exports.getAllQuestions = async () => {
  return await prisma.question.findMany();
};

/**
 * Update a question by ID.
 * @param {number} questionId - The ID of the question to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} The updated question.
 * @throws {Error} If the question does not exist.
 */
module.exports.updateQuestion = async (questionId, data) => {
  try {
    return await prisma.question.update({
      where: { questionId: questionId },
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
};

/**
 * Delete a question by ID.
 * @param {number} questionId - The ID of the question to delete.
 * @returns {Promise<Object>} The deleted question.
 * @throws {Error} If the question does not exist.
 */
module.exports.deleteQuestion = async (questionId) => {
  try {
    return await prisma.question.delete({
      where: { questionId: questionId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
};

/**
 * Get a question by ID.
 * @param {number} questionId - The ID of the question to retrieve.
 * @returns {Promise<Object>} The found question.
 * @throws {Error} If the question does not exist.
 */
module.exports.getQuestionById = async (questionId) => {
  try {
    return await prisma.question.findUnique({
      where: { questionId: questionId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
};

/**
 * Get all questions related to a specific project.
 * Includes questions directly linked to the project or by project type.
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array>} List of questions.
 */
module.exports.getQuestionsByProject = async (projectId) => {
  try {
    return await prisma.question.findMany({
      where: {
        OR: [
          // Questions directly linked to the project
          { projects: { some: { projectId: projectId } } },
          // Questions linked by project type
          {
            types: {
              some: { projectTypes: { some: { projectId: projectId } } },
            },
          },
        ],
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Project not found");
    }
    throw error;
  }
};

/**
 * Get all questions by category.
 * @param {string} category - The category name.
 * @returns {Promise<Array>} List of questions in the category.
 */
module.exports.getQuestionsByCategory = async (category) => {
  return await prisma.question.findMany({
    where: { category: category },
  });
};

/**
 * Get all questions by type.
 * @param {number} typeId - The type ID.
 * @returns {Promise<Array>} List of questions with the given type.
 */
module.exports.getQuestionsByType = async (typeId) => {
  try {
    return await prisma.question.findMany({
      where: { types: { some: { typeId: typeId } } },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Type not found");
    }
    throw error;
  }
};

/**
 * Get all subquestions for a parent question.
 * @param {number} questionIdParent - The parent question ID.
 * @returns {Promise<Array>} List of subquestions.
 */
module.exports.getSubQuestions = async (questionIdParent) => {
  try {
    return await prisma.question.findMany({
      where: { questionIdParent: questionIdParent },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("ParentQuestion not found");
    }
    throw error;
  }
};
