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


  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
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
