const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

// Create a new response
module.exports.createResponse = async (data) => {
  return await prisma.response.create({ data });
};

// Update a response by ID
module.exports.updateResponse = async (responseId, data) => {
  await checkIdExistence(prisma.response, responseId, "Response not found");
  return await prisma.response.update({
    where: { responseId: responseId },
    data,
  });
};

// Delete a response by ID
module.exports.deleteResponse = async (responseId) => {
  await checkIdExistence(prisma.response, responseId, "Response not found");
  return await prisma.response.delete({
    where: { responseId: responseId },
  });
};

// TODO: Get responses by question of a project
module.exports.getResponsesByQuestionOfProject = async (
  projectId,
  questionId
) => {
  return await prisma.response.findMany({
    where: { projectId: projectId, questionId: questionId },
  });
};

// Get responses by project
module.exports.getResponsesByProject = async (projectId) => {
  await checkIdExistence(prisma.response, projectId, "Project not found");
  return await prisma.response.findMany({
    where: { projectId: projectId },
  });
};
