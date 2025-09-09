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
  const question = await prisma.question.findUnique({
    where: { questionId: questionId },
    include: { projects: true, types: true },
  });

  if (!question) {
    throw new Error("Question not found");
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
  const projectWithQuestions = await prisma.project.findUnique({
    where: { projectId: projectId },
    include: {
      questions: true, // Specific questions
      types: {
        include: {
          projectTypes: {
            where: { projectId },
            include: { questions: true }, // Questions via type
          },
        },
      },
    },
  });

  if (!projectWithQuestions) {
    throw new Error("Project not found");
  }
  // Flatten and combine questions
  const typeQuestions = projectWithQuestions.types.flatMap((type) =>
    type.projectTypes.flatMap((pt) => pt.questions)
  );

  const allQuestions = [...projectWithQuestions.questions, ...typeQuestions];

  // Optionally remove duplicates
  const questions = Array.from(
    new Map(allQuestions.map((q) => [q.questionId, q])).values()
  );

  return questions;
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
  const typeWithQuestions = await prisma.type.findUnique({
    where: { typeId: typeId },
    include: { questions: true },
  });

  if (!typeWithQuestions) {
    throw new Error("Type not found");
  }

  return typeWithQuestions.questions;
};

/**
 * Get all subquestions for a parent question.
 * @param {number} questionIdParent - The parent question ID.
 * @returns {Promise<Array>} List of subquestions.
 */
module.exports.getSubQuestions = async (questionIdParent) => {
  const parentQuestion = await prisma.question.findUnique({
    where: { questionIdParent: questionIdParent },
    include: { children: true },
  });

  if (!parentQuestion) {
    throw new Error("QuestionParent not found");
  }

  return parentQuestion.children;
};
