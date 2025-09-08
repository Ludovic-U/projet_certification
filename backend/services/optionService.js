const { prisma } = require("../prisma/prismaClient");

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
  try {
    return await prisma.option.update({ where: { optionId: optionId }, data });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Option not found");
    }
    throw error;
  }
};

/**
 * Delete an option by ID.
 * @param {number} optionId - The ID of the option to delete.
 * @return {Promise<Object>} The deleted option.
 * @throws {Error} If the option does not exist.
 */
module.exports.deleteOption = async (optionId) => {
  try {
    return await prisma.option.delete({ where: { optionId: optionId } });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Option not found");
    }
    throw error;
  }
};

/**
 * Get an option by ID.
 * @param {number} optionId - The ID of the option to retrieve.
 * @returns {Promise<Object>} The found option.
 * @throws {Error} If the option does not exist.
 */
module.exports.getOptionById = async (optionId) => {
  try {
    return await prisma.option.findUnique({ where: { optionId: optionId } });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Option not found");
    }
    throw error;
  }
};

/**
 * Get all options by question.
 * @param { number} questionId - The question ID.
 * @returns {Promise<Array>} List of options.
 */
module.exports.getOptionsByQuestion = async (questionId) => {
  try {
    return await prisma.option.findMany({ where: { questionId: questionId } });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
};
