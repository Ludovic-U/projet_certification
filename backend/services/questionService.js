const { prisma } = require("../prisma/prismaClient");
const {
  getPaginationOptions,
  getPaginationMeta,
} = require("./helper/pagination");

const questionBaseSelect = {
  questionId: true,
  label: true,
  keyword: true,
  category: true,
  onglet: true,
  numberOfSelectionableOpt: true,
  questionIdParent: true,
};

/**
 * Create a new question.
 *
 * @async
 * @function createQuestion
 * @param {Object} data - The question data to create.
 * @param {string} data.label - The question text.
 * @param {string} [data.keyword] - The keyword for the question.
 * @param {string} data.category - The category of the question.
 * @param {number|null} [data.numberOfSelectionableOpt=null] - Max number of selectable options.
 * @param {number|null} [data.questionIdParent=null] - Parent question ID if this is a sub-question.
 * @param {Array<number>} [data.types] - Type IDs to associate.
 * @param {Array<number>} [data.projects] - Project IDs to associate.
 * @param {Array<number>} [data.options] - Option IDs to associate.
 * @returns {Promise<Object>} The created question, including related types, projects and options.
 */
module.exports.createQuestion = async (data) => {
  const { types, projects, options, ...questionData } = data;
  delete questionData.isRelevant;
  delete questionData.hasMultipleOpenResponse;
  delete questionData.shouldMultiply;
  delete questionData.questionCategoryId;

  // Ensure category is not null - use a default if not provided
  if (questionData.category === null || questionData.category === undefined) {
    questionData.category = 'general';
  }

  return await prisma.question.create({
    data: {
      ...questionData,
      onglet: questionData.onglet ?? "analyse_existant",
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
    select: {
      ...questionBaseSelect,
      types: true,
      projects: true,
      options: true,
    },
  });
};

/**
 * Get all questions with paginations.
 *
 * @async
 * @function getAllQuestions
 * @param {number} page - Page number for pagination (default 1).
 * @param {number} limit - Number of questions per page (default 10).
 * @returns {Promise<Object>} Returns an object containing:
 * - data: Array of questions, each including related types.
 * - meta: Pagination info including total items, current page, limit, and total pages.
 */
module.exports.getAllQuestions = async (page, limit) => {
  // const skip = (page - 1) * limit;
  const { skip, take } = getPaginationOptions(page, limit);

  const [questions, totalItems] = await Promise.all([
    prisma.question.findMany({
      skip,
      take,
      select: { ...questionBaseSelect, types: true },
    }),
    prisma.question.count(),
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);

  return {
    data: questions,
    meta,
  };
};

/**
 * Update a question by ID.questio
 *
 * @async
 * @function updateQuestion
 * @param {number} questionId - The ID of the question to update.
 * @param {Object} data - The fields to update.
 * @param {string} data.label - Updated question text.
 * @param {string} data.category - Updated question category.
 * @param {number} data.numberOfSelectionableOpt - Updated max selectable options.
 * @param {number} data.questionIdParent - Updated parent question ID.
 * @param {Array<number>} data.addType - Type IDs to connect.
 * @param {Array<number>} data.removeType - Type IDs to disconnect.
 * @param {Array<number>} data.addProject - Project IDs to connect.
 * @param {Array<number>} data.removeProject - Project IDs to disconnect.
 * @returns {Promise<Object>} The updated question, including related types and projects.
 * @throws {Error} If the question does not exist.
 */
module.exports.updateQuestion = async (questionId, data) => {
  const { addType, removeType, addProject, removeProject, ...questionData } =
    data;
  delete questionData.isRelevant;
  delete questionData.hasMultipleOpenResponse;
  delete questionData.shouldMultiply;
  delete questionData.questionCategoryId;

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
      select: {
        ...questionBaseSelect,
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
      select: questionBaseSelect,
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
 * @returns {Promise<Object>} The found question, including responses, projects, types, options and children.
 * @throws {Error} If the question does not exist.
 */
module.exports.getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { questionId: questionId },
    select: {
      ...questionBaseSelect,
      responses: true,
      projects: true,
      types: true,
      options: true,
      children: {
        select: {
          ...questionBaseSelect,
          responses: true,
        },
      },
    },
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
 * @returns {Promise<Array<Object>>} List of questions for the project, including there responses and options.
 * @throws {Error} If the project does not exist.
 */
module.exports.getQuestionsByProject = async (projectId) => {
  const projectWithQuestions = await prisma.project.findUnique({
    where: { projectId },
    include: {
      questions: {
        select: {
          ...questionBaseSelect,
          responses: true,
          options: true,
          types: true,
        },
      }, // Direct relation between Project and Question
      types: {
        include: {
          questions: {
            select: {
              ...questionBaseSelect,
              responses: true,
              options: true,
              types: true,
            },
          }, // Direct relation between Type and Question
        },
      },
    },
  });

  if (!projectWithQuestions) {
    throw new Error("Project not found");
  }

  const projectTypeIds = projectWithQuestions.types.map((type) => type.typeId);

  if (projectTypeIds.length === 0) {
    return projectWithQuestions.questions;
  }

  const questions = await prisma.question.findMany({
    where: {
      types: {
        some: {
          typeId: { in: projectTypeIds },
        },
      },
    },
    select: {
      ...questionBaseSelect,
      responses: true,
      options: true,
      types: true,
    },
  });

  return questions;
};

/**
 * Get all questions by category.
 *
 * @async
 * @function getQuestionsByCategory
 * @param {string} category - The category name.
 * @returns {Promise<Array<Object>>} List of questions in the category, including projects and types.
 */
module.exports.getQuestionsByCategory = async (category) => {
  return await prisma.question.findMany({
    where: { category: category },
    select: { ...questionBaseSelect, types: true, projects: true },
  });
};

/**
 * Get all questions by type.
 *
 * @async
 * @function getQuestionsByType
 * @param {number} typeId - The type ID.
 * @returns {Promise<Array<Object>>} List of questions with the given type, including there projects and types.
 * @throws {Error} If the type does not exist.
 */
module.exports.getQuestionsByType = async (typeId) => {
  const typeWithQuestions = await prisma.type.findUnique({
    where: { typeId: typeId },
    include: {
      questions: {
        select: {
          ...questionBaseSelect,
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
    select: {
      questionId: true,
      children: { select: questionBaseSelect },
    },
  });

  if (!parentQuestion) {
    throw new Error("QuestionParent not found");
  }

  return parentQuestion.children;
};

/**
 * Get all question categories.
 *
 * @async
 * @function getAllCategories
 * @returns {Promise<Array<Object>>} List of all question categories.
 */
module.exports.getAllCategories = async () => {
  return await prisma.questionCategory.findMany();
};

/**
 * Create a new question category.
 *
 * @async
 * @function createCategory
 * @param {Object} data - The category data to create.
 * @param {string} data.label - The category label.
 * @returns {Promise<Object>} The created category.
 */
module.exports.createCategory = async (data) => {
  return await prisma.questionCategory.create({
    data: {
      label: data.label,
    },
  });
};

/**
 * Delete a question category by ID.
 *
 * @async
 * @function deleteCategory
 * @param {number} questionCategoryId - The category ID to delete.
 * @returns {Promise<Object>} The deleted category.
 */
module.exports.deleteCategory = async (questionCategoryId) => {
  const category = await prisma.questionCategory.findUnique({
    where: { questionCategoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.label?.trim().toLowerCase() === "analyse opportunité") {
    throw new Error("Category deletion forbidden");
  }

  return await prisma.questionCategory.delete({
    where: { questionCategoryId },
  });
};
