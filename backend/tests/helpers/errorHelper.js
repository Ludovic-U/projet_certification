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

module.exports = { expectError };
