/**
 * Helper function to create a new Question in the database, optionally with related projects, types, and options.
 *
 * @async
 * @function newQuestion
 * @param {Object} params - Parameters for the new question.
 * @param {string} [params.label="Default Question"] - The label/text of the question.
 * @param {string} [params.category="Default"] - The category of the question.
 * @param {number|null} [params.numberOfSelectionableOpt=null] - Number of selectable options.
 * @param {boolean} [params.isRelevant=false] - Whether the question is relevant.
 * @param {boolean} [params.hasMultipleOpenResponse=false] - Whether the question allows multiple open responses.
 * @param {boolean} [params.shouldMultiply=false] - Whether the question should multiply responses.
 * @param {string|null} [params.questionIdParent=null] - Optional parent question ID.
 * @param {Array<string>} [params.projects=[]] - Array of project IDs to connect.
 * @param {Array<string>} [params.types=[]] - Array of type IDs to connect.
 * @param {Array<string>} [params.options=[]] - Array of option labels to create with the question.
 * @returns {Promise<Object>} Resolves to the created question object, including connected projects, types, and options.
 */
async function newQuestion({
  label = "Default Question",
  category = "Default",
  numberOfSelectionableOpt = null,
  isRelevant = false,
  hasMultipleOpenResponse = false,
  shouldMultiply = false,
  questionIdParent = null,
  projects = [],
  types = [],
  options = [],
} = {}) {
  const question = await global.prisma.question.create({
    data: {
      label,
      category,
      numberOfSelectionableOpt,
      isRelevant,
      hasMultipleOpenResponse,
      shouldMultiply,
      questionIdParent,
      projects: projects.length
        ? { connect: projects.map((projectId) => ({ projectId })) }
        : undefined,
      types: types.length
        ? { connect: types.map((typeId) => ({ typeId })) }
        : undefined,
      options: options?.length
        ? { create: options.map((label) => ({ label })) }
        : undefined,
    },
    include: {
      projects: true,
      types: true,
      options: true,
    },
  });

  return question;
}

/**
 * Helper function to create a new Response in the database.
 *
 * @async
 * @function newResponse
 * @param {Object} params - Parameters for the new response.
 * @param {string} [params.label="Default Response"] - The label/text of the response.
 * @param {string} params.projectId - The project ID the response belongs to.
 * @param {string} params.questionId - The question ID the response belongs to.
 * @param {string|null} [params.optionId=null] - Optional associated option ID.
 * @param {string|null} [params.responseIdParent=null] - Optional parent response ID.
 * @returns {Promise<Object>} Resolves to the created response object.
 */
async function newResponse({
  label = "Default Repsonse",
  projectId = null,
  questionId,
  optionId = null,
  responseIdParent = null,
}) {
  const response = await global.prisma.response.create({
    data: {
      label,
      projectId,
      questionId,
      optionId,
      responseIdParent,
    },
    include: { children: true },
  });

  return response;
}

/**
 * Helper function to create a new Type in the database, optionally connecting to projects and questions.
 *
 * @async
 * @function newType
 * @param {Object} params - Parameters for the new type.
 * @param {string} [params.label="Default Type"] - The label of the type.
 * @param {Array<string>} [params.projects=[]] - Array of project IDs to connect.
 * @param {Array<string>} [params.questions=[]] - Array of question IDs to connect.
 * @returns {Promise<Object>} Resolves to the created type object, including connected projects and questions.
 */
async function newType({
  label = "Default Type",
  projects = [],
  questions = [],
}) {
  const type = await global.prisma.type.create({
    data: {
      label,
      projects: projects.length
        ? { connect: projects.map((projectId) => ({ projectId })) }
        : undefined,
      questions: questions.length
        ? { connect: questions.map((questionId) => ({ questionId })) }
        : undefined,
    },
    include: {
      projects: true,
      questions: true,
    },
  });

  return type;
}

/**
 * Helper function to create a new Option in the database.
 *
 * @async
 * @function newOption
 * @param {Object} params - Parameters for the new option.
 * @param {string} [params.label="Default Option"] - The label/text of the option.
 * @param {string} params.questionId - The question ID this option belongs to.
 * @returns {Promise<Object>} Resolves to the created option object.
 */
async function newOption({ label = "Default Option", questionId }) {
  const option = await global.prisma.option.create({
    data: { label, questionId },
  });

  return option;
}

// TODO: Still WIP
async function newProject({
  projectName = "Default ProjectName",
  types = [],
  questions = [],
}) {
  const project = await global.prisma.project.create({
    data: {
      projectName,
      types: types.length
        ? { connect: types.map((typeId) => ({ typeId })) }
        : undefined,
      questions: questions.length
        ? { connect: questions.map((questonId) => ({ questonId })) }
        : undefined,
    },
    include: { types: true, questions: true },
  });

  return project;
}

module.exports = { newQuestion, newResponse, newType, newOption, newProject };
