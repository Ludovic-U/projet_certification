/**
 * Checks if a record exists in the database for the given model and condition.
 * Throws a 404 error if the record is not found.
 *
 * @async
 * @function checkIdExistence
 * @param {Object} model - The Prisma model to query (e.g., prisma.question).
 * @param {Object} condition - The condition to match (e.g., { id: 1 }).
 * @param {string} [errorMessage="Not found"] - Optional custom error message for not found.
 * @throws {Error} Throws an error with statusCode 404 if the record does not exist.
 * @returns {Promise<Object>} The found record.
 */

async function checkIdExistence(model, condition, errorMessage = "Not found") {
  const record = await model.findUnique({ where: condition });
  if (!record) {
    const error = new Error(errorMessage);
    error.statusCode = 404;
    throw error;
  }
  return record;
}

module.exports = { checkIdExistence };
