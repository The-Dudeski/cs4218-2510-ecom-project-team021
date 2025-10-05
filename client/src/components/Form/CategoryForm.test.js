import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "./CategoryForm";

describe("CategoryForm", () => {
  let handleSubmitMock;
  let setValueMock;

  beforeEach(() => {
    handleSubmitMock = jest.fn((e) => e.preventDefault()); 
    setValueMock = jest.fn();
  });

  it("renders all components", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmitMock}
        value=""
        setValue={setValueMock}
      />
    );

    expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("does not update value if input is empty", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmitMock}
        value=""
        setValue={setValueMock}
      />
    );

    const input = screen.getByPlaceholderText("Enter new category");

    fireEvent.change(input, { target: { value: "" } });
    expect(setValueMock).not.toHaveBeenCalled();
  });

  it("updates value on valid input change", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmitMock}
        value=""
        setValue={setValueMock}
      />
    );

    const input = screen.getByPlaceholderText("Enter new category");

    fireEvent.change(input, { target: { value: "bags" } });
    expect(setValueMock).toHaveBeenCalledWith("bags");
  });

  it("calls handleSubmit when form is submitted", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmitMock}
        value="bags"
        setValue={setValueMock}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
 
  });

  it("logs to console once when handleSubmit is called", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const handleSubmitWithLog = jest.fn((e) => {
      e.preventDefault();
      console.log("Form submitted!");
    });

    render(
      <CategoryForm
        handleSubmit={handleSubmitWithLog}
        value="bags"
        setValue={setValueMock}
      />
    );

    const button = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(button);

    expect(handleSubmitWithLog).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Form submitted!");

    consoleSpy.mockRestore();
  });
});
