const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

/**
 * Create a new option.
 * @param {Object} data - The option data to create.
 * @returns {Promise<Object>} The created option.
 */
module.exports.createOption = async (data) => {
  return await prisma.option.create({ data });
};
