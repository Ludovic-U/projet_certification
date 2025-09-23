const facoryFunction = require("./facory_function");

/**
 * Seeds the database with 3 standalone questions.
 *
 * @async
 * @function seedWith3Questions
 * @returns {Promise<Array<Object>>} Resolves to an array of 3 created question objects.
 */
async function seedWith3Questions() {
  const questions = [];
  for (let i = 0; i < 3; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
    });
    questions.push(question);
  }
  return questions;
}

/**
 * Seeds the database with a parent question and 2 subquestions.
 *
 * @async
 * @function seedQuestionWithSubquestion
 * @returns {Promise<Object>} Resolves to an object containing:
 *  - questionParent: The parent question object.
 *  - subquestions: Array of 2 created subquestion objects linked to the parent.
 */
async function seedQuestionWithSubquestion() {
  const question = await facoryFunction.newQuestion({
    label: "Question with subquestions",
  });

  const subquestions = [];
  for (let i = 0; i < 2; i++) {
    const subquestion = await facoryFunction.newQuestion({
      label: `Subquestion ${i + 1}`,
      questionIdParent: question.questionId,
    });
    subquestions.push(subquestion);
  }

  // Refecth the question parent to have children
  const questionParent = await global.prisma.question.findUnique({
    where: { questionId: question.questionId },
    include: { children: true },
  });

  return { questionParent, subquestions };
}

/**
 * Seeds the database with 2 questions under a specific category.
 *
 * @async
 * @function seedQuestionsWithCategory
 * @param {string} category - The category to assign to the created questions.
 * @returns {Promise<Array<Object>>} Resolves to an array of 2 created question objects with the specified category.
 */
async function seedQuestionsWithCategory(category) {
  const questions = [];
  for (let i = 0; i < 2; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
      category: category,
    });
    questions.push(question);
  }
  return questions;
}

/**
 * Seeds the database with a type and 2 questions associated with that type.
 *
 * @async
 * @function seedQuestionsWithType
 * @returns {Promise<Array<Object>>} Resolves to an array of 2 created question objects linked to the created type.
 */
async function seedQuestionsWithType() {
  const type = await facoryFunction.newType({ label: "Type1" });

  const questions = [];
  for (let i = 0; i < 2; i++) {
    const question = await facoryFunction.newQuestion({
      label: `Question ${i + 1}`,
      types: [type.typeId],
    });
    questions.push(question);
  }
  return { type, questions };
}

async function seedProjectWithQuestions() {
  const { project, question } = await seedWithProjectAndQuestion();
  const { type, questions } = await seedQuestionsWithType();

  // Linked project and type
  await global.prisma.type.update({
    where: { typeId: type.typeId },
    data: {
      projects: {
        connect: { projectId: project.projectId },
      },
    },
  });

  // Refecth the project to have question and type tied
  const newProject = await global.prisma.project.findUnique({
    where: { projectId: project.projectId },
    include: { questions: true, types: true },
  });

  return { project: newProject, question, typeQuestions: questions };
}

/**
 * Seeds the database with 3 standalone types.
 *
 * @async
 * @function seedWith3types
 * @returns {Promise<Array<Object>>} Resolves to an array of 3 created type objects.
 */
async function seedWith3types() {
  const types = [];
  for (let i = 0; i < 3; i++) {
    const type = await facoryFunction.newType({ label: `Type ${i + 1}` });
    types.push(type);
  }
  return types;
}

/**
 * Seeds the database with a question that has 2 options.
 *
 * @async
 * @function seedQuestionWithOptions
 * @returns {Promise<Object>} Resolves to an object containing:
 *  - question: The created question object.
 *  - options: Array of created option objects linked to the question.
 */
async function seedQuestionWithOptions() {
  const question = await facoryFunction.newQuestion({
    options: ["Opt1", "Opt2"],
  });
  return { question, options: question.options };
}

async function seedWithProjectAndQuestion() {
  const { project } = await seedProjectWithClientAndManager();
  const question = await facoryFunction.newQuestion({
    projects: [project.projectId],
  });

  // Refecth the project to have question tied
  const fetchProject = await global.prisma.project.findUnique({
    where: { projectId: project.projectId },
    include: { questions: true },
  });

  return { project: fetchProject, question };
}

/**
 * Seeds a project along with a question and multiple responses.
 *
 * @async
 * @function seedProjectWithResponses
 * @returns {Promise<Object>} Returns an object containing:
 *  - project: The created project object.
 *  - question: The created question object associated with the project.
 *  - responses: An array of 3 response objects linked to the project and question.
 */
async function seedProjectWithResponses() {
  const { project, question } = await seedWithProjectAndQuestion();
  const responses = [];
  for (let i = 0; i < 3; i++) {
    const response = await facoryFunction.newResponse({
      label: `Response${i + 1}`,
      projectId: project.projectId,
      questionId: question.questionId,
    });
    responses.push(response);
  }
  return { project, question, responses };
}

async function seedResponseWithSubresponse() {
  const { project } = await seedProjectWithClientAndManager();
  const { questionParent, subquestions } = await seedQuestionWithSubquestion();
  const response = await facoryFunction.newResponse({
    label: "Response of QuestionParent",
    projectId: project.projectId,
    questionId: questionParent.questionId,
  });
  const subresponse = await facoryFunction.newResponse({
    label: "Response of Subquestion",
    projectId: project.projectId,
    questionId: subquestions[0].questionId,
    responseIdParent: response.responseId,
  });

  // Refecth the response parent to have children
  const responseParent = await global.prisma.response.findUnique({
    where: { responseId: response.responseId },
    include: { children: true },
  });

  return { responseParent, subresponse };
}

async function seedProjectWithClientAndManager() {
  const client = await facoryFunction.newClient();
  const user = await facoryFunction.newUser();
  const project = await facoryFunction.newProject({
    projectManager: user.userId,
    clientId: client.clientId,
  });

  return { client, user, project };
}

module.exports = {
  seedWith3Questions,
  seedQuestionWithSubquestion,
  seedQuestionsWithCategory,
  seedQuestionsWithType,
  seedWith3types,
  seedQuestionWithOptions,
  seedProjectWithResponses,
  seedResponseWithSubresponse,
  seedWithProjectAndQuestion,
  seedProjectWithQuestions,
  seedProjectWithClientAndManager,
};
