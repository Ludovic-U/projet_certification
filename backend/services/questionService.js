const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

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
  await checkIdExistence(prisma.question, questionId, "Question not found");
  return await prisma.question.update({
    where: { questionId: questionId },
    data,
  });
};

/**
 * Delete a question by ID.
 * @param {number} questionId - The ID of the question to delete.
 * @returns {Promise<Object>} The deleted question.
 * @throws {Error} If the question does not exist.
 */
module.exports.deleteQuestion = async (questionId) => {
  await checkIdExistence(prisma.question, questionId, "Question not found");
  return await prisma.question.delete({
    where: { questionId: questionId },
  });
};

/**
 * Get a question by ID.
 * @param {number} questionId - The ID of the question to retrieve.
 * @returns {Promise<Object>} The found question.
 * @throws {Error} If the question does not exist.
 */
module.exports.getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { questionId: questionId },
  });
  if (!question) {
    const error = new Error("Question not found");
    error.status = 404;
    throw error;
  }
  return question;
};

/**
 * Get all questions related to a specific project.
 * Includes questions directly linked to the project or by project type.
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array>} List of questions.
 */
module.exports.getQuestionsByProject = async (projectId) => {
  const allQuestions = await prisma.question.findMany({
    where: {
      OR: [
        // Questions directly linked to the project
        { projects: { some: { projectId: projectId } } },
        // Questions linked by project type
        {
          types: { some: { projectTypes: { some: { projectId: projectId } } } },
        },
      ],
    },
  });
  return allQuestions;
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
  return await prisma.question.findMany({
    where: { types: { some: { typeId: typeId } } },
  });
};

/**
 * Get all subquestions for a parent question.
 * @param {number} questionIdParent - The parent question ID.
 * @returns {Promise<Array>} List of subquestions.
 */
module.exports.getSubQuestions = async (questionIdParent) => {
  return await prisma.question.findMany({
    where: { questionIdParent: questionIdParent },
  });
};
