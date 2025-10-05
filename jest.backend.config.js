export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",
  transform: {},

  // which test to run
  testMatch: ["<rootDir>/models/categoryModel.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["models/categoryModel.test.js"],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20,
    },
  },
};
