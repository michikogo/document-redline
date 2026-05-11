import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import SearchBar from "../components/SearchBar";

describe("SearchBar", () => {
  it("renders the input and button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with trimmed value on submit", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await userEvent.type(screen.getByRole("textbox"), "  agreement  ");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("agreement");
  });

  it("calls onSearch with empty string when input is blank", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("renders custom placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Search contracts…" />);
    expect(
      screen.getByPlaceholderText("Search contracts…"),
    ).toBeInTheDocument();
  });
});
