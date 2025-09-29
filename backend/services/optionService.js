const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new option.
 *
 * @async
 * @function createOption
 * @param {Object} data - The option data to create.
 * @param {string} data.label - The option text.
 * @param {string} data.questionId - The ID of the associated question.
 * @returns {Promise<Object>} The created response.
 */
module.exports.createOption = async (data) => {
  return await prisma.option.create({ data });
};

/**
 * Update an option by ID.
 *
 * @async
 * @function updateOption
 * @param {number} optionId - The ID of the option to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.label] - Updated option text.
 * @param {string} [data.questionId] - Updated the associated question ID.
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
 *
 * @async
 * @function deleteOption
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
 *
 * @async
 * @function getOptionById
 * @param {number} optionId - The ID of the option to retrieve.
 * @returns {Promise<Object>} The found option.
 * @throws {Error} If the option does not exist.
 */
module.exports.getOptionById = async (optionId) => {
  const option = await prisma.option.findUnique({
    where: { optionId: optionId },
  });

  if (!option) {
    throw new Error("Option not found");
  }

  return option;
};

/**
 * Get all options by question ID.
 *
 * @async
 * @function getOptionsByQuestion
 * @param { number} questionId - The question ID.
 * @returns {Promise<Array>} List of options.
 * @throws {Error} If the question does not exist.
 */
module.exports.getOptionsByQuestion = async (questionId) => {
  const questionWithOptions = await prisma.question.findUnique({
    where: { questionId: questionId },
    include: { options: true },
  });

  if (!questionWithOptions) {
    throw new Error("Question not found");
  }

  return questionWithOptions.options;
};
