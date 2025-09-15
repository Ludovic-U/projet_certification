const { prisma } = require("../prisma/prismaClient");

/**
 * Create a new type.
 * @param {Object} data - The type data to create.
 * @returns {Promise<Object>} The created type.
 */
module.exports.createType = async (data) => {
  const { questions, ...typeData } = data;

  return await prisma.type.create({
    data: {
      ...typeData,
      questions:
        Array.isArray(questions) && questions.length > 0
          ? {
              connect: questions.map((questionId) => ({ questionId })),
            }
          : undefined,
    },
    include: { questions: true },
  });
};

/**
 * Get all types.
 * @returns {Promise<Array>} List of all types.
 */
module.exports.getAllTypes = async () => {
  return await prisma.type.findMany({});
};

/**
 * Update a type by ID.
 * @param {number} typeId - The ID of the type to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} The updated type.
 * @throws {Error} If the type does not exist.
 */
module.exports.updateType = async (typeId, data) => {
  const { addQuestion, removeQuestion, typeData } = data;

  try {
    return await prisma.type.update({
      where: { typeId: typeId },
      data: {
        ...typeData,
        // Add / Remove questions
        questions:
          (Array.isArray(addQuestion) && addQuestion.length > 0) ||
          (Array.isArray(removeQuestion) && removeQuestion.length > 0)
            ? {
                connect:
                  Array.isArray(addQuestion) && addQuestion.length > 0
                    ? addQuestion.map((questionId) => ({ questionId }))
                    : undefined,
                disconnect:
                  Array.isArray(removeQuestion) && removeQuestion.length > 0
                    ? removeQuestion.map((questionId) => ({ questionId }))
                    : undefined,
              }
            : undefined,
      },
      include: { questions: true },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Type not found");
    }
    throw error;
  }
};

/**
 * Delete a type by ID.
 * @param {number} typeId - The ID of the type to delete.
 * @returns {Promise<Object>} The deleted type.
 * @throws {Error} If the type does not exist.
 */
module.exports.deleteType = async (typeId) => {
  try {
    return await prisma.type.delete({
      where: { typeId: typeId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Type not found");
    }
    throw error;
  }
};

/**
 * Get a type by ID.
 * @param {number} typeId - The ID of the type to retrieve.
 * @returns {Promise<Object>} The found type.
 * @throws {Error} If the type does not exist.
 */
module.exports.getTypeById = async (typeId) => {
  const type = await prisma.type.findUnique({
    where: { typeId: typeId },
  });

  if (!type) {
    throw new Error("Type not found");
  }

  return type;
};
