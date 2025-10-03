import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";

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

  it("renders the icons correctly", () => {
    expect(screen.getByTestId("icon-mail")).toBeInTheDocument();
    expect(screen.getByTestId("icon-phone")).toBeInTheDocument();
    expect(screen.getByTestId("icon-support")).toBeInTheDocument();
  });
});
