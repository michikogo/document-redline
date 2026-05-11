import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ChangeLog from "../components/ChangeLog";

vi.mock("../api/client", () => ({
  getChanges: vi.fn(),
}));

import { getChanges } from "../api/client";

const mockChanges = [
  {
    id: "c1",
    document_id: "doc1",
    target_text: "Licensee",
    occurrence: 1,
    replacement: "Client",
    applied_at: "2026-01-01T12:00:00Z",
  },
  {
    id: "c2",
    document_id: "doc1",
    target_text: "Agreement",
    occurrence: 2,
    replacement: "Contract",
    applied_at: "2026-01-02T09:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChangeLog", () => {
  it("shows empty state when there are no changes", async () => {
    vi.mocked(getChanges).mockResolvedValue([]);
    render(<ChangeLog documentId="doc1" refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("No changes yet.")).toBeInTheDocument();
    });
  });

  it("renders a list of changes", async () => {
    vi.mocked(getChanges).mockResolvedValue(mockChanges);
    render(<ChangeLog documentId="doc1" refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("Licensee")).toBeInTheDocument();
      expect(screen.getByText("Client")).toBeInTheDocument();
      expect(screen.getByText("Agreement")).toBeInTheDocument();
      expect(screen.getByText("Contract")).toBeInTheDocument();
    });
  });

  it("shows occurrence number for each change", async () => {
    vi.mocked(getChanges).mockResolvedValue(mockChanges);
    render(<ChangeLog documentId="doc1" refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("(occurrence 1)")).toBeInTheDocument();
      expect(screen.getByText("(occurrence 2)")).toBeInTheDocument();
    });
  });

  it("re-fetches when refreshKey changes", async () => {
    vi.mocked(getChanges).mockResolvedValue([]);
    const { rerender } = render(<ChangeLog documentId="doc1" refreshKey={0} />);

    rerender(<ChangeLog documentId="doc1" refreshKey={1} />);

    await waitFor(() => {
      expect(getChanges).toHaveBeenCalledTimes(2);
    });
  });

  it("shows error message on fetch failure", async () => {
    vi.mocked(getChanges).mockRejectedValue(new Error("Network error"));
    render(<ChangeLog documentId="doc1" refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });
});
