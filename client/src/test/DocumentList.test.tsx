import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DocumentList from "../components/DocumentList";

vi.mock("../api/client", () => ({
  getDocuments: vi.fn(),
}));

import { getDocuments } from "../api/client";

const mockDocs = [
  {
    id: "doc1",
    title: "NDA Agreement",
    version: 1,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "doc2",
    title: "Vendor Contract",
    version: 3,
    updated_at: "2026-01-02T00:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DocumentList", () => {
  it("shows empty state when there are no documents", async () => {
    vi.mocked(getDocuments).mockResolvedValue([]);
    render(<DocumentList selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No documents yet.")).toBeInTheDocument();
    });
  });

  it("renders document titles", async () => {
    vi.mocked(getDocuments).mockResolvedValue(mockDocs);
    render(<DocumentList selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("NDA Agreement")).toBeInTheDocument();
      expect(screen.getByText("Vendor Contract")).toBeInTheDocument();
    });
  });

  it("calls onSelect with the document id when clicked", async () => {
    vi.mocked(getDocuments).mockResolvedValue(mockDocs);
    const onSelect = vi.fn();
    render(<DocumentList selectedId={null} onSelect={onSelect} />);

    await waitFor(() => screen.getByText("NDA Agreement"));
    await userEvent.click(screen.getByText("NDA Agreement"));

    expect(onSelect).toHaveBeenCalledWith("doc1");
  });

  it("shows error message on fetch failure", async () => {
    vi.mocked(getDocuments).mockRejectedValue(new Error("Failed to load"));
    render(<DocumentList selectedId={null} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });
  });
});
