module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.integration.js"],
  testMatch: ["<rootDir>/tests/integration/**/response.test.[jt]s"],
  maxWorkers: 1,
};
