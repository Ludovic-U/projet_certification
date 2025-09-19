module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.integration.js"],
  testMatch: ["<rootDir>/tests/integration/**/question.test.[jt]s"],
  maxWorkers: 1,
};
