module.exports = {
  displayName: "integration",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.integration.js"],
  testMatch: ["<rootDir>/tests/integration/**/*.test.[jt]s"],
  maxWorkers: 1,
};
