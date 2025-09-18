module.exports.newQuestion = async ({
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
} = {}) => {
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
};

module.exports.newResponse = async ({
  label = "Default Repsonse",
  projectId,
  questionId,
  optionId = null,
  responseIdParent = null,
}) => {
  const response = await global.prisma.response.create({
    data: {
      label,
      projectId,
      questionId,
      optionId,
      responseIdParent,
    },
  });

  return response;
};

module.exports.newType = async ({
  label = "Default Type",
  projects = [],
  questions = [],
}) => {
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
};

module.exports.newOption = async ({ label = "Default Option", questionId }) => {
  const option = await global.prisma.option.create({
    data: { label, questionId },
  });

  return option;
};

// TODO: Still WIP
module.exports.newProject = async ({
  projectName = "Default ProjectName",
  types = [],
  questions = [],
}) => {
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
};
