module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.test.js"],
  testMatch: ["<rootDir>/tests/integration/**/*.test.[jt]s"],
  maxWorkers: 1,
};
