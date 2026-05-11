import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import Drawer from "../components/Drawer";

describe("Drawer", () => {
  it("renders children when open", () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <p>Form content</p>
      </Drawer>,
    );
    expect(screen.getByText("Form content")).toBeInTheDocument();
  });

  it("renders children when closed (hidden via CSS)", () => {
    render(
      <Drawer open={false} onClose={vi.fn()}>
        <p>Form content</p>
      </Drawer>,
    );
    expect(screen.getByText("Form content")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open={true} onClose={onClose}>
        <p>content</p>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the Update Doc heading", () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <p>content</p>
      </Drawer>,
    );
    expect(screen.getByText("Update Doc")).toBeInTheDocument();
  });
});
