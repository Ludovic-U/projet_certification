/**
 * Helper function to test error responses from controller functions.
 *
 * @async
 * @function expectError
 * @param {Function} controller - The controller function to test.
 * @param {Object} req - The mock request object.
 * @param {Object} res - The mock response object (should have jest.fn() for status and json).
 * @param {Function} [mockFunctions] - Optional function to set up mocks before calling the controller.
 * @param {number} expectedStatus - The expected HTTP status code.
 * @param {string} expectedMessage - The expected error message in the response.
 *
 * @returns {Promise<void>}
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
