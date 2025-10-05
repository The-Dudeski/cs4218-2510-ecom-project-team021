import React from "react";

const CategoryForm = ({ handleSubmit, value, setValue, testId = "category-input"}) => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            data-testid={testId}
            type="text"
            className="form-control"
            placeholder="Enter new category"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <button
          data-testid={testId === "create-category-input" ? "create-submit" : "update-submit"}
          type="submit"
          className="btn btn-primary"
        >
          Submit
        </button>
      </form>
    </>
  );
};

export default CategoryForm;