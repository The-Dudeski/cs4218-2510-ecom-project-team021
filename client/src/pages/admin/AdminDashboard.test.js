import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { act } from "react"; 
import { useAuth } from "../../context/auth";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mocked AdminMenu</div>
));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

describe("AdminDashboard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all main components (Layout, AdminMenu, Admin Info card)", () => {
    useAuth.mockReturnValue([
      { user: { name: "rena", email: "rena@test.com", phone: "123456" } },
    ]);

    render(<AdminDashboard />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();

    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

    expect(screen.getByText(/Admin Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact/i)).toBeInTheDocument();
  });

  it("renders the correct admin info when useAuth provides user", () => {
    useAuth.mockReturnValue([
       { user: { name: "rena", email: "rena@test.com", phone: "123456" } },
    ]);

    render(<AdminDashboard />);

    expect(screen.getByText("Admin Name : rena")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : rena@test.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 123456")).toBeInTheDocument();
  });

  it("shows fallback message if user info is missing", () => {
		useAuth.mockReturnValue([{ user: null }]);

		render(<AdminDashboard />);

		expect(screen.getByText("Admin information not found")).toBeInTheDocument();
		expect(screen.queryByText(/Admin Name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Admin Email/i)).not.toBeInTheDocument();
  	expect(screen.queryByText(/Admin Contact/i)).not.toBeInTheDocument();

	});
});

describe("Integration Tests — AdminDashboard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the full admin dashboard flow with user info and subcomponents", async () => {
    // Mock user returned by useAuth
    useAuth.mockReturnValue([
      { user: { name: "rena", email: "rena@test.com", phone: "12345678" } },
    ]);

    render(<AdminDashboard />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Admin Name : rena")).toBeInTheDocument();
      expect(screen.getByText("Admin Email : rena@test.com")).toBeInTheDocument();
      expect(screen.getByText("Admin Contact : 12345678")).toBeInTheDocument();
    });
  });

  it("handles the fallback scenario when no user info is provided", async () => {
    useAuth.mockReturnValue([{ user: null }]); 

    render(<AdminDashboard />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Admin information not found")).toBeInTheDocument();
      expect(screen.queryByText(/Admin Name/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Admin Email/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Admin Contact/i)).not.toBeInTheDocument();
    });
  });

  it("gracefully re-renders if useAuth returns undefined (edge case)", async () => {
    useAuth.mockReturnValue([undefined]); 

    render(<AdminDashboard />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Admin information not found")).toBeInTheDocument();
    });
  });
});