const facoryFunction = require("./facory_function");

module.exports.seedWith3Questions = async () => {
  const questions = [];
  for (let i = 0; i < 3; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
    });
    questions.push(question);
  }
  return questions;
};

module.exports.seedQuestionWithSubquestion = async () => {
  const questionParent = await facoryFunction.newQuestion({
    label: "Question with subquestions",
  });

  const subquestions = [];
  for (let i = 0; i < 2; i++) {
    const subquestion = await facoryFunction.newQuestion({
      label: `Subquestion ${i + 1}`,
      questionIdParent: questionParent.questionId,
    });
    subquestions.push(subquestion);
  }
  return { questionParent, subquestions };
};

module.exports.seedQuestionsWithCategory = async (category) => {
  const questions = [];
  for (let i = 0; i < 2; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
      category: category,
    });
    questions.push(question);
  }
  return questions;
};

module.exports.seedQuestionsWithType = async () => {
  const type = await facoryFunction.newType({ label: "Type1" });

  const questions = [];
  for (let i = 0; i < 2; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
      types: [type.typeId],
    });
    questions.push(question);
  }
  return questions;
};
