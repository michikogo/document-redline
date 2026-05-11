import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import SearchResults from "../components/SearchResults";

const mockResults = [
  {
    document_id: "doc1",
    title: "NDA Agreement",
    snippets: ["…the Licensee shall comply with the Agreement terms…"],
  },
  {
    document_id: "doc2",
    title: "Vendor Contract",
    snippets: ["…Agreement governs all vendor relationships…"],
  },
];

describe("SearchResults", () => {
  it("shows empty state when results array is empty", () => {
    render(<SearchResults results={[]} query="agreement" />);
    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });

  it("renders document titles", () => {
    render(<SearchResults results={mockResults} query="agreement" />);
    expect(screen.getByText("NDA Agreement")).toBeInTheDocument();
    expect(screen.getByText("Vendor Contract")).toBeInTheDocument();
  });

  it("renders snippet text", () => {
    render(<SearchResults results={mockResults} query="agreement" />);
    const pre = document.querySelector("pre");
    expect(pre?.textContent).toMatch(/the Licensee shall comply/);
  });

  it("highlights the query term in snippets", () => {
    render(<SearchResults results={mockResults} query="Agreement" />);
    const marks = document.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
  });

  it("calls onSelectDocument with document id when title is clicked", async () => {
    const onSelectDocument = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="agreement"
        onSelectDocument={onSelectDocument}
      />,
    );
    await userEvent.click(screen.getByText("NDA Agreement"));
    expect(onSelectDocument).toHaveBeenCalledWith("doc1");
  });
});
