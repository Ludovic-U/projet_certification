module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.integration.js"],
  testMatch: ["<rootDir>/tests/integration/**/type.test.[jt]s"],
  maxWorkers: 1,
};
