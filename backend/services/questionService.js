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
