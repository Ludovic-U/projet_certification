const { prisma } = require("../prisma/prismaClient");

// Create a new question
module.exports.createQuestion = async (data) => {
  return await prisma.question.create(data);
};
