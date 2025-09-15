module.exports.newQuestion = async ({
  label = "Default Question",
  category = "Default",
  numberOfSelectionableOpt = null,
  isRelevant = false,
  hasMultipleOpenResponse = false,
  shouldMultiply = false,
  questionIdParent = null,
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

module.exports.newType = async ({ label = "Default Type" }) => {
  const type = await global.prisma.type.create({
    data: { label },
  });
  return type;
};

module.exports.newOption = async ({ label = "Default Option", questionId }) => {
  const option = await global.prisma.option.create({
    data: { label, questionId },
  });
  return option;
};
