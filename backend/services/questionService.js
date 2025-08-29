const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

// Create a new question
module.exports.createQuestion = async (data) => {
  return await prisma.question.create({ data });
};

// Get all questions
module.exports.getAllQuestions = async () => {
  return await prisma.question.findMany();
};

// Update a question by ID
module.exports.updateQuestion = async (questionId, data) => {
  await checkIdExistence(prisma.question, questionId, "Question not found");
  return await prisma.question.update({
    where: { questionId: questionId },
    data,
  });
};

// Delete a question by ID
module.exports.deleteQuestion = async (questionId) => {
  await checkIdExistence(prisma.question, questionId, "Question not found");
  return await prisma.question.delete({
    where: { questionId: questionId },
  });
};

// Get a question by ID
module.exports.getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { questionId: questionId },
  });
  if (!question) {
    const error = new Error("Question not found");
    error.status = 404;
    throw error;
  }
  return question;
};

// TODO: Add getQuestionsByProject service

// Get questions by category
module.exports.getQuestionsByCategory = async (category) => {
  return await prisma.question.findMany({
    where: { category: category },
  });
};

// Get questions by type
module.exports.getQuestionsByType = async (typeId) => {
  return await prisma.question.findMany({
    where: { types: { some: { typeId: typeId } } },
  });
};

// Get subquestions by parent question ID
module.exports.getSubQuestions = async (questionIdParent) => {
  return await prisma.question.findMany({
    where: { questionIdParent: questionIdParent },
  });
};
