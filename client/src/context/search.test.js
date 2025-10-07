import React from "react";  
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search"; // adjust filename if needed

function Consumer() {
  const [search, setSearch] = useSearch();
  return (
    <>
      <div data-testid="keyword">{search.keyword}</div>
      <button
        onClick={() =>
          setSearch({ ...search, keyword: "test" })
        }
      >
        update
      </button>
    </>
  );
}

test("default keyword is empty", () => {
  render(
    <SearchProvider>
      <Consumer />
    </SearchProvider>
  );
  expect(screen.getByTestId("keyword")).toHaveTextContent("");
});

test("updates keyword", () => {
  render(
    <SearchProvider>
      <Consumer />
    </SearchProvider>
  );
  fireEvent.click(screen.getByText("update"));
  expect(screen.getByTestId("keyword")).toHaveTextContent("test");
});
