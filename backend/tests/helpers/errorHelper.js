/**
 * Helper function to test error responses from controller functions.
 *
 * @async
 * @function expectError
 * @param {Function} controller - The controller function to test.
 * @param {Object} req - The mock request object.
 * @param {Object} res - The mock response object (should have jest.fn() for `status` and `json`).
 * @param {Function} [mockFunctions] - Optional function to set up mocks before calling the controller.
 * @param {number} expectedStatus - The expected HTTP status code.
 * @param {string} expectedMessage - The expected error message in the response.
 * @returns {Promise<void>} Resolves once expectations are validated.
 */
async function expectError(
  controller,
  req,
  res,
  mockFunctions,
  expectedStatus,
  expectedMessage
) {
  if (mockFunctions) mockFunctions();

  await controller(req, res);

  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith({ error: expectedMessage });
}

/**
 * Helper to test `400 Bad Request` responses for invalid or missing parameters.
 *
 * @async
 * @function invalidOrMissingStatus
 * @param {Function} controllerMethod - The controller function under test.
 * @param {Object} req - The mock request object.
 * @param {Object} res - The mock response object.
 * @param {jest.Mock} serviceMethod - The mocked service method (should not be called).
 * @param {string} message - The expected error message.
 * @returns {Promise<void>} Resolves once expectations are validated.
 */
async function invalidOrMissingStatus(
  controllerMethod,
  req,
  res,
  serviceMehtod,
  message
) {
  await expectError(controllerMethod, req, res, () => {}, 400, message);

  expect(serviceMehtod).not.toHaveBeenCalled();
}

/**
 * Helper to test `404 Not Found` responses when an entity is missing.
 *
 * @async
 * @function notFoundStatus
 * @param {Function} controllerMethod - The controller function under test.
 * @param {Object} req - The mock request object.
 * @param {Object} res - The mock response object.
 * @param {jest.Mock} serviceMethod - The mocked service method.
 * @param {string} name - The entity name (used in error message, e.g. "Question not found").
 * @returns {Promise<void>} Resolves once expectations are validated.
 */
async function notFoundStatus(controllerMethod, req, res, serviceMehtod, name) {
  await expectError(
    controllerMethod,
    req,
    res,
    () => serviceMehtod.mockRejectedValue(new Error(`${name} not found`)),
    404,
    `${name} not found`
  );

  expect(serviceMehtod).toHaveBeenCalled();
}

/**
 * Helper to test `500 Internal Server Error` responses.
 *
 * @async
 * @function internalServerErrorStatus
 * @param {Function} controllerMethod - The controller function under test.
 * @param {Object} req - The mock request object.
 * @param {Object} res - The mock response object.
 * @param {jest.Mock} serviceMethod - The mocked service method.
 * @returns {Promise<void>} Resolves once expectations are validated.
 */
async function internalServerErrorStatus(
  controllerMethod,
  req,
  res,
  serviceMehtod
) {
  await expectError(
    controllerMethod,
    req,
    res,
    () => serviceMehtod.mockRejectedValue(new Error("Database error")),
    500,
    "Internal server error"
  );

  expect(serviceMehtod).toHaveBeenCalled();
}

module.exports = {
  expectError,
  invalidOrMissingStatus,
  notFoundStatus,
  internalServerErrorStatus,
};
