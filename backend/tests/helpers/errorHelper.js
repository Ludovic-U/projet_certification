async function expectError(
  controller,
  req,
  res,
  prismaMocks,
  expectedStatus,
  expectedMessage
) {
  if (prismaMocks) prismaMocks();

  await controller(req, res);

  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith({ error: expectedMessage });
}

module.exports = { expectError };
