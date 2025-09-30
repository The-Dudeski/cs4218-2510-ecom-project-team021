const store = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => (store[key] = value)),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => {
      for (const key in store) delete store[key];
    }),
  },
});

import React from 'react';
import { render } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './auth';

const TestComponent = () => {
  const [auth] = useAuth();
  return (
    <>
      <div data-testid="user">{auth?.user?.name || "no-user"}</div>
      <div data-testid="token">{auth?.token || "no-token"}</div>
    </>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key in store) delete store[key];
  });

  it("initializes with default empty state when localStorage has no auth", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe("no-user");
    expect(getByTestId("token").textContent).toBe("no-token");
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  it("initializes from localStorage and sets axios Authorization header", () => {
    const fakeAuth = { user: { name: "John Doe" }, token: "mockToken123" };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(fakeAuth));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(localStorage.getItem).toHaveBeenCalledWith("auth");
    expect(getByTestId("user").textContent).toBe("John Doe");
    expect(getByTestId("token").textContent).toBe("mockToken123");
    expect(axios.defaults.headers.common["Authorization"]).toBe("mockToken123");
  });
});
