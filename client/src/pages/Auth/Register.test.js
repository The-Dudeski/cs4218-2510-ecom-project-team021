import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };

  jest.useFakeTimers();
      

describe('Register Component - Unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
  });

  it('should display error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce({ message: 'User already exists' });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should display backend error message when API returns success = false', async () => {
  // Arrange
  axios.post.mockResolvedValueOnce({
    data: { success: false, message: 'Invalid input' }
  });

  const { getByText, getByPlaceholderText } = render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'jane@example.com' } });
  fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
  fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '9876543210' } });
  fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '456 Lane' } });
  fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '1999-12-12' } });
  fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Basketball' } });

  // Act
  fireEvent.click(getByText('REGISTER'));

  // Assert
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(toast.error).toHaveBeenCalledWith('Invalid input'); // 👈 this covers line 34
});

});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Register Component — Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test ("should register successfully and navigate to /login", async () => {
    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Fill out form
    fireEvent.change(getByPlaceholderText("Enter Your Name"), { target: { value: "John Doe" } });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), { target: { value: "john@example.com" } });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), { target: { value: "password123" } });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), { target: { value: "1234567890" } });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), { target: { value: "123 Street" } });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), { target: { value: "2000-01-01" } });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), { target: { value: "Football" } });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    jest.runAllTimers();

    expect(toast.success).toHaveBeenCalledWith("Register Successfully, please login");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });

  it("should display toast error when backend rejects registration", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), { target: { value: "Alice" } });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), { target: { value: "alice@example.com" } });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), { target: { value: "password" } });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), { target: { value: "9999999999" } });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), { target: { value: "1 Lane" } });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), { target: { value: "1999-09-09" } });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), { target: { value: "Tennis" } });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should display backend message when user already exists", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "User already exists" },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), { target: { value: "John" } });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), { target: { value: "test@example.com" } });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), { target: { value: "password123" } });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), { target: { value: "1234567890" } });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), { target: { value: "123 Street" } });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), { target: { value: "2000-01-01" } });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), { target: { value: "Football" } });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("User already exists");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

