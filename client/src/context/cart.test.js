const store = {};
Object.defineProperty(global, "localStorage", {
  value: {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => (store[key] = value)),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => {
      for (const key in store) delete store[key];
    }),
  },
  writable: true,
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

const TestComponent = () => {
  const [cart, setCart] = useCart();
  return (
    <>
      <div data-testid="cart-length">{cart.length}</div>
      <button onClick={() => setCart([...cart, { id: cart.length + 1 }])}>
        Add Item
      </button>
    </>
  );
};

describe("CartProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes cart from localStorage if data exists", () => {
    const fakeCart = [{ id: 1 }, { id: 2 }];
    global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(fakeCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(global.localStorage.getItem).toHaveBeenCalledWith("cart");
    expect(screen.getByTestId("cart-length").textContent).toBe("2");
  });

  it("provides context updates correctly when setCart is called", () => {
    global.localStorage.getItem.mockReturnValueOnce(null);

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("cart-length").textContent).toBe("0");

    fireEvent.click(screen.getByText("Add Item"));
    expect(screen.getByTestId("cart-length").textContent).toBe("1");

    fireEvent.click(screen.getByText("Add Item"));
    expect(screen.getByTestId("cart-length").textContent).toBe("2");
  });
});
