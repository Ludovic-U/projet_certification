const { prisma } = require("../prisma/prismaClient");
const { checkIdExistence } = require("../utils/checkIdExistence");

// Create a new Type
module.exports.createType = async (data) => {
  return await prisma.type.create({ data });
};

// Get all types
module.exports.getAllTypes = async () => {
  return await prisma.type.findMany({});
};

// Update a type by ID
module.exports.updateType = async (typeId, data) => {
  await checkIdExistence(prisma.type, typeId, "Type not found");
  return await prisma.type.update({
    where: { typeId: typeId },
    data,
  });
};

// Delete a type by ID
module.exports.deleteType = async (typeId) => {
  await checkIdExistence(prisma.type, typeId, "Type not found");
  return await prisma.type.delete({
    where: { typeId: typeId },
  });
};

// Get a type by ID
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
