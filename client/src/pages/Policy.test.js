import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "./Policy";
import "@testing-library/jest-dom";

// Unit tests
jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout">
    <div data-testid="layout-title">{title}</div>
    {children}
  </div>
));

describe("Policy Page", () => {
  beforeEach(() => {
    render(<Policy />);
  });

  it("renders the Layout with the correct title", () => {
    expect(screen.getByTestId("layout-title")).toHaveTextContent("Privacy Policy");
  });

  it("renders the policy image correctly", () => {
    const img = screen.getByAltText(/privacy/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});

// Integration Tests
test("renders Privacy Policy correctly inside Layout", () => {
  render(<Policy />);
  expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
});

test("renders all policy items and the image", () => {
  render(<Policy />);
  const items = screen.getAllByText(/your|data|payments|contact/i);
  expect(items.length).toBeGreaterThanOrEqual(4);

  const img = screen.getByAltText(/privacy/i);
  expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
});
