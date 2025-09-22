const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new question.
 *
 * @async
 * @function createQuestion
 * @param {Object} data - The question data to create.
 * @param {string} data.label - The question text.
 * @param {string} data.category - The category of the question.
 * @param {number|null} [data.numberOfSelectionableOpt] - Max number of selectable options.
 * @param {boolean} [data.isRelevant=false] - Whether the question is relevant.
 * @param {boolean} [data.hasMultipleOpenResponse=false] - Whether multiple open responses are allowed.
 * @param {boolean} [data.shouldMultiply=false] - Whether the question should be multiplied.
 * @param {number|null} [data.questionIdParent] - Parent question ID if this is a sub-question.
 * @param {Array<number>} [data.types] - Type IDs to associate.
 * @param {Array<number>} [data.projects] - Project IDs to associate.
 * @param {Array<number>} [data.options] - Option IDs to associate.
 * @returns {Promise<Object>} The created question, including related types, projects and options.
 */
module.exports.createQuestion = async (data) => {
  const { types, projects, options, ...questionData } = data;

  return await prisma.question.create({
    data: {
      ...questionData,
      types:
        Array.isArray(types) && types.length > 0
          ? {
              connect: types.map((typeId) => ({ typeId })),
            }
          : undefined,

      projects:
        Array.isArray(projects) && projects.length > 0
          ? {
              connect: projects.map((projectId) => ({ projectId })),
            }
          : undefined,

      options: options?.length
        ? { create: options.map((label) => ({ label })) }
        : undefined,
    },
    include: {
      types: true,
      projects: true,
      options: true,
    },
  });
};

/**
 * Get all questions.
 *
 * @async
 * @function getAllQuestions
 * @returns {Promise<Array<Object>>} List of all questions.
 */
module.exports.getAllQuestions = async () => {
  return await prisma.question.findMany({ include: { types: true } });
};

/**
 * Update a question by ID.
 *
 * @async
 * @function updateQuestion
 * @param {number} questionId - The ID of the question to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.label] - Updated question text.
 * @param {string} [data.category] - Updated question category.
 * @param {number|null} [data.numberOfSelectionableOpt] - Updated max selectable options.
 * @param {boolean} [data.isRelevant] - Updated relevance flag.
 * @param {boolean} [data.hasMultipleOpenResponse] - Updated open response flag.
 * @param {boolean} [data.shouldMultiply] - Updated multiplication flag.
 * @param {number|null} [data.questionIdParent] - Updated parent question ID.
 * @param {Array<number>} [data.addType] - Type IDs to connect.
 * @param {Array<number>} [data.removeType] - Type IDs to disconnect.
 * @param {Array<number>} [data.addProject] - Project IDs to connect.
 * @param {Array<number>} [data.removeProject] - Project IDs to disconnect.
 * @returns {Promise<Object>} The updated question, including related types and projects.
 * @throws {Error} If the question does not exist.
 */
module.exports.updateQuestion = async (questionId, data) => {
  const { addType, removeType, addProject, removeProject, ...questionData } =
    data;

  try {
    return await prisma.question.update({
      where: { questionId: questionId },
      data: {
        ...questionData,
        // Add / Remove types
        types:
          (Array.isArray(addType) && addType.length > 0) ||
          (Array.isArray(removeType) && removeType.length > 0)
            ? {
                connect:
                  Array.isArray(addType) && addType.length > 0
                    ? addType.map((typeId) => ({ typeId }))
                    : undefined,
                disconnect:
                  Array.isArray(removeType) && removeType.length > 0
                    ? removeType.map((typeId) => ({ typeId }))
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
      include: {
        types: true,
        projects: true,
      },
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
 *
 * @async
 * @function deleteQuestion
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
 *
 * @async
 * @function getQuestionById
 * @param {number} questionId - The ID of the question to retrieve.
 * @returns {Promise<Object>} The found question, including projects and types.
 * @throws {Error} If the question does not exist.
 */
module.exports.getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { questionId: questionId },
    include: { projects: true, types: true, options: true, children: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  return question;
};

/**
 * Get all questions related to a specific project.
 * Includes questions directly linked to the project and via project types.
 *
 * @async
 * @function getQuestionsByProject
 * @param {number} projectId - The project ID.
 * @returns {Promise<Array<Object>>} List of questions for the project.
 * @throws {Error} If the project does not exist.
 */
module.exports.getQuestionsByProject = async (projectId) => {
  const projectWithQuestions = await prisma.project.findUnique({
    where: { projectId },
    include: {
      questions: true, // Direct relation between Project and Question
      types: {
        include: {
          questions: true, // Direct relation between Type and Question
        },
      },
    },
  });

  if (!projectWithQuestions) {
    throw new Error("Project not found");
  }

  // Gather questions from both direct project relation and via types
  const typeQuestions = projectWithQuestions.types.flatMap(
    (type) => type.questions
  );

  const allQuestions = [...projectWithQuestions.questions, ...typeQuestions];

  // Deduplicate by questionId
  const questions = Array.from(
    new Map(allQuestions.map((q) => [q.questionId, q])).values()
  );

  return questions;
};

/**
 * Get all questions by category.
 *
 * @async
 * @function getQuestionsByCategory
 * @param {string} category - The category name.
 * @returns {Promise<Array<Object>>} List of questions in the category.
 */
module.exports.getQuestionsByCategory = async (category) => {
  return await prisma.question.findMany({
    where: { category: category },
    include: { types: true, projects: true },
  });
};

/**
 * Get all questions by type.
 *
 * @async
 * @function getQuestionsByType
 * @param {number} typeId - The type ID.
 * @returns {Promise<Array<Object>>} List of questions with the given type.
 * @throws {Error} If the type does not exist.
 */
module.exports.getQuestionsByType = async (typeId) => {
  const typeWithQuestions = await prisma.type.findUnique({
    where: { typeId: typeId },
    include: {
      questions: {
        include: {
          types: true,
          projects: true,
        },
      },
    },
  });

  if (!typeWithQuestions) {
    throw new Error("Type not found");
  }

  return typeWithQuestions.questions;
};

/**
 * Get all subquestions for a parent question.
 *
 * @async
 * @function getSubQuestions
 * @param {number} questionIdParent - The parent question ID.
 * @returns {Promise<Array<Object>>} List of subquestions.
 * @throws {Error} If the parent question does not exist.
 */
module.exports.getSubQuestions = async (questionIdParent) => {
  const parentQuestion = await prisma.question.findUnique({
    where: { questionId: questionIdParent },
    include: { children: true },
  });

  if (!parentQuestion) {
    throw new Error("QuestionParent not found");
  }

  return parentQuestion.children;
};
