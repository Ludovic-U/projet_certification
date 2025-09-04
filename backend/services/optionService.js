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

/**
 * Update an option by ID.
 * @param {number} optionId - The ID of the option to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} The updated option.
 * @throws {Error} If the option does not exist.
 */
module.exports.updateOption = async (optionId, data) => {
  await checkIdExistence(prisma.option, optionId, "Option not found");
  return await prisma.option.update({ where: { optionId: optionId }, data });
};

/**
 * Delete an option by ID.
 * @param {number} optionId - The ID of the option to delete.
 * @return {Promise<Object>} The deleted option.
 * @throws {Error} If the option does not exist.
 */
module.exports.deleteOption = async (optionId) => {
  await checkIdExistence(prisma.option, optionId, "Option not found");
  return await prisma.option.delete({ where: { optionId: optionId } });
};
