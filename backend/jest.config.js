module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/tests/integration/**/*.test.[jt]s"],
  maxWorkers: 1,
};
