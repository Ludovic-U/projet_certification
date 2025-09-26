module.exports = {
  displayName: "userflow",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.userflow.js"],
  testMatch: ["<rootDir>/tests/userflows/**/*.test.[jt]s"],
  maxWorkers: 1,
};
