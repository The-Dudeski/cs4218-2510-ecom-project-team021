// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const originalWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg, ...args) => {
    if (typeof msg === "string" && msg.includes("React Router Future Flag Warning")) {
      return; // ignore this specific warning
    }
    if (typeof msg === "string" && msg.includes("ReactDOMTestUtils.act is deprecated")) {
      return; // ignore ReactDOMTestUtils.act deprecation warning
    }
    originalWarn(msg, ...args); // keep all other warnings
  });
});

afterAll(() => {
  console.warn.mockRestore();
});