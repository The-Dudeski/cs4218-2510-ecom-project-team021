export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // discover all frontend tests under client/src
  testMatch: ["<rootDir>/client/src/**/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    // Only include tested pages to target 100% page coverage
    'client/src/pages/About.js',
    'client/src/pages/CartPage.js',
    'client/src/pages/Contact.js',
    'client/src/pages/Policy.js',
    'client/src/pages/Pagenotfound.js',
    'client/src/pages/Categories.js',
    'client/src/pages/CategoryProduct.js',
    'client/src/pages/ProductDetails.js',
    'client/src/pages/Search.js',
    // Exclude generated content
    '!client/src/_site/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/client/src/_site/',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};
