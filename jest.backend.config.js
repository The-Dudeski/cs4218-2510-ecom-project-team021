export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/**/*.test.js"],
  
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/frontend/",
    "<rootDir>/client/",
    "<rootDir>/src/"
  ],

  testTimeout: 30000,

  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage", // ensure all backend coverage goes here
  coverageReporters: ["text", "lcov"],


  // jest code coverage
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "middlewares/**/*.js",
    "helpers/**/*.js",
    "!**/node_modules/**",
    "!**/config/**",
    "!**/coverage/**",
    "!**/playwright-report/**",
    "!**/server.js",
    "!**/jest.*.js",
    "!**/frontend/**",
    "!**/client/**",
    "!**/src/**"
  ],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20,
    },
  },
};
