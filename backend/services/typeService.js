const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

/**
 * Create a new type.
 * @param {Object} data - The type data to create.
 * @returns {Promise<Object>} The created type.
 */
module.exports.createType = async (data) => {
  return await prisma.type.create({ data });
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
  await checkIdExistence(prisma.type, typeId, "Type not found");
  return await prisma.type.update({
    where: { typeId: typeId },
    data,
  });
};

/**
 * Delete a type by ID.
 * @param {number} typeId - The ID of the type to delete.
 * @returns {Promise<Object>} The deleted type.
 * @throws {Error} If the type does not exist.
 */
module.exports.deleteType = async (typeId) => {
  await checkIdExistence(prisma.type, typeId, "Type not found");
  return await prisma.type.delete({
    where: { typeId: typeId },
  });
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
    const error = new Error("Type not found");
    error.status = 404;
    throw error;
  }
  return type;
};
