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
