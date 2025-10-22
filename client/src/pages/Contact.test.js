import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import "@testing-library/jest-dom";

// Unit tests
jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout">
    <div>{title}</div>
    {children}
  </div>
));

jest.mock("react-icons/bi", () => ({
  BiMailSend: () => <svg data-testid="icon-mail" />,
  BiPhoneCall: () => <svg data-testid="icon-phone" />,
  BiSupport: () => <svg data-testid="icon-support" />,
}));

describe("Contact Page", () => {
  beforeEach(() => {
    render(<Contact />);
  });

  it("renders the CONTACT US heading", () => {
    expect(
      screen.getByRole("heading", { name: /contact us/i })
    ).toBeInTheDocument();
  });

  it("renders the contact info text", () => {
    expect(
      screen.getByText(/for any query or info about product/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/www\.help@ecommerceapp\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000/)).toBeInTheDocument();
  });

  it("renders the contact image correctly", () => {
    const img = screen.getByAltText(/contactus/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});

// Integration Tests
test("renders Contact page correctly within Layout", () => {
  render(<Contact />);
  expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  expect(screen.getByText(/available 24x7/i)).toBeInTheDocument();
});

test("displays correct contact info and image", () => {
  render(<Contact />);
  expect(screen.getByText(/help@ecommerceapp.com/i)).toBeInTheDocument();
  expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();

  const img = screen.getByAltText(/contactus/i);
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
});