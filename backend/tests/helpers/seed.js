const facoryFunction = require("./facory_function");

/**
 * Seeds the database with 3 standalone questions.
 *
 * @async
 * @function seedWith3Questions
 * @returns {Promise<Array<Object>>} Resolves to an array of 3 created question objects.
 */
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

/**
 * Seeds the database with a parent question and 2 subquestions.
 *
 * @async
 * @function seedQuestionWithSubquestion
 * @returns {Promise<Object>} Resolves to an object containing:
 *  - questionParent: The parent question object.
 *  - subquestions: Array of 2 created subquestion objects linked to the parent.
 */
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

/**
 * Seeds the database with 2 questions under a specific category.
 *
 * @async
 * @function seedQuestionsWithCategory
 * @param {string} category - The category to assign to the created questions.
 * @returns {Promise<Array<Object>>} Resolves to an array of 2 created question objects with the specified category.
 */
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

/**
 * Seeds the database with a type and 2 questions associated with that type.
 *
 * @async
 * @function seedQuestionsWithType
 * @returns {Promise<Array<Object>>} Resolves to an array of 2 created question objects linked to the created type.
 */
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

/**
 * Seeds the database with 3 standalone types.
 *
 * @async
 * @function seedWith3types
 * @returns {Promise<Array<Object>>} Resolves to an array of 3 created type objects.
 */
module.exports.seedWith3types = async () => {
  const types = [];
  for (let i = 0; i < 3; i++) {
    const type = await facoryFunction.newType({ label: `Type ${i + 1}` });
    types.push(type);
  }
  return types;
};

/**
 * Seeds the database with a question that has 2 options.
 *
 * @async
 * @function seedQuestionWithOptions
 * @returns {Promise<Object>} Resolves to an object containing:
 *  - question: The created question object.
 *  - options: Array of created option objects linked to the question.
 */
module.exports.seedQuestionWithOptions = async () => {
  const question = await facoryFunction.newQuestion({
    options: ["Opt1", "Opt2"],
  });
  return { question, options: question.options };
};
