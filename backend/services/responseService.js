const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

// Create a new response
module.exports.createResponse = async (data) => {
  return await prisma.response.create({ data });
};
