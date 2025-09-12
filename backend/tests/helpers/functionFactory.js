async function newQuestion({
  label = "Default label",
  category = "Default",
  numberOfSelectionableOpt = null,
  isRelevant = false,
  hasMultipleOpenResponse = false,
  shouldMultiply = false,
  questionIdParent = null,
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
    },
  });
  return question;
}

module.exports = { newQuestion };
