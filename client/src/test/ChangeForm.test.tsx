import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ChangeForm from "../components/ChangeForm";

vi.mock("../api/client", () => ({
  applyChanges: vi.fn(),
}));

import { applyChanges } from "../api/client";

const mockDoc = {
  id: "doc1",
  title: "Test Doc",
  content: "Hello world",
  version: 2,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChangeForm", () => {
  it("renders all fields and the submit button", () => {
    render(<ChangeForm documentId="doc1" onSuccess={vi.fn()} />);
    expect(screen.getByPlaceholderText("Text to replace")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Replace with")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  it("prefills target text from initialTarget prop", () => {
    render(
      <ChangeForm
        documentId="doc1"
        initialTarget="Licensee"
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText("Text to replace")).toHaveValue(
      "Licensee",
    );
  });

  it("disables submit button when target text is empty", () => {
    render(<ChangeForm documentId="doc1" onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
  });

  it("calls applyChanges with correct args on submit", async () => {
    vi.mocked(applyChanges).mockResolvedValue(mockDoc);
    const onSuccess = vi.fn();
    render(
      <ChangeForm
        documentId="doc1"
        initialTarget="Hello"
        onSuccess={onSuccess}
      />,
    );

    await userEvent.clear(screen.getByPlaceholderText("Replace with"));
    await userEvent.type(screen.getByPlaceholderText("Replace with"), "Hi");
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(applyChanges).toHaveBeenCalledWith("doc1", [
        {
          operation: "replace",
          target: { text: "Hello", occurrence: 1 },
          replacement: "Hi",
        },
      ]);
      expect(onSuccess).toHaveBeenCalledWith(mockDoc);
    });
  });

  it("shows error message when applyChanges rejects", async () => {
    vi.mocked(applyChanges).mockRejectedValue(new Error("Target not found"));
    render(
      <ChangeForm
        documentId="doc1"
        initialTarget="Missing"
        onSuccess={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Replace with"), "Replacement");
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText("Target not found")).toBeInTheDocument();
    });
  });

  it("shows Applying... while loading", async () => {
    vi.mocked(applyChanges).mockImplementation(() => new Promise(() => {}));
    render(
      <ChangeForm
        documentId="doc1"
        initialTarget="Hello"
        onSuccess={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Replace with"), "Hi");
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByRole("button", { name: /applying/i })).toBeDisabled();
  });
});
