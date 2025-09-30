import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "./Policy";

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
    const img = screen.getByAltText(/contactus/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  it("renders the privacy policy content", () => {
    const paragraphs = screen.getAllByText(/add privacy policy/i);
    expect(paragraphs).toHaveLength(7);
    paragraphs.forEach(p => expect(p).toBeInTheDocument());
  });
});
