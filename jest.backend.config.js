export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/productController.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/productController.js"],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20,
    },
  },
};
