export default {
  // --- Display name ---
  displayName: "frontend",

  // --- Browser-like environment for React tests ---
  testEnvironment: "jsdom",

  // --- Use Babel to transform JS/JSX ---
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  // --- Handle CSS imports in tests ---
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // --- Discover frontend tests only ---
  testMatch: ["<rootDir>/client/src/**/*.test.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/playwright-report/",
  ],

  // --- Coverage configuration ---
  collectCoverage: true,
  coverageDirectory: "<rootDir>/client/coverage", // ✅ where SonarQube expects
  coverageReporters: ["text", "lcov"], // ✅ lcov needed for Sonar
  collectCoverageFrom: [
    "client/src/**/*.{js,jsx}",
    "!client/src/**/__tests__/**",
    "!client/src/**/*.test.js",
    "!client/src/_site/**",
    "!client/src/setupTests.js",
    "!client/src/index.js",
  ],

  // --- Coverage thresholds (optional) ---
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
    },
  },

  // --- Setup (for React Testing Library / jest-dom) ---
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};

