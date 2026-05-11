import { describe, it, expect } from "vitest";
import { applyChange, applyChanges } from "../src/services/changeService";

describe("applyChange", () => {
  it("replaces the first occurrence", () => {
    const result = applyChange(
      "The Licensee agrees. The Licensee shall pay.",
      "Licensee",
      1,
      "Client",
    );
    expect(result).toBe("The Client agrees. The Licensee shall pay.");
  });

  it("replaces the second occurrence, not the first", () => {
    const result = applyChange(
      "The Licensee agrees. The Licensee shall pay.",
      "Licensee",
      2,
      "Client",
    );
    expect(result).toBe("The Licensee agrees. The Client shall pay.");
  });

  it("throws when target text is not found", () => {
    expect(() => applyChange("Hello world", "nonexistent", 1, "X")).toThrow(
      'target.text "nonexistent" not found in document',
    );
  });

  it("throws when occurrence exceeds match count", () => {
    expect(() =>
      applyChange("The Licensee agrees.", "Licensee", 2, "Client"),
    ).toThrow("occurrence 2 exceeds match count (1)");
  });

  it("throws when target text is empty", () => {
    expect(() => applyChange("Hello world", "", 1, "X")).toThrow(
      "target.text cannot be empty",
    );
  });

  it("throws when occurrence is less than 1", () => {
    expect(() => applyChange("Hello world", "Hello", 0, "Hi")).toThrow(
      "occurrence must be >= 1",
    );
  });

  it("handles overlapping match positions correctly", () => {
    const result = applyChange("aaa", "aa", 1, "bb");
    expect(result).toBe("bba");
  });

  it("replaces with an empty string", () => {
    const result = applyChange("Hello world", "world", 1, "");
    expect(result).toBe("Hello ");
  });
});

describe("applyChanges", () => {
  it("applies multiple changes in sequence", () => {
    const result = applyChanges("The Licensee agrees. The Vendor supplies.", [
      {
        target: { text: "Licensee", occurrence: 1 },
        replacement: "Client",
      },
      {
        target: { text: "Vendor", occurrence: 1 },
        replacement: "Supplier",
      },
    ]);
    expect(result).toBe("The Client agrees. The Supplier supplies.");
  });

  it("applies changes in order — earlier replacements affect later occurrence counts", () => {
    const result = applyChanges("foo foo foo", [
      { target: { text: "foo", occurrence: 1 }, replacement: "bar" },
      { target: { text: "foo", occurrence: 1 }, replacement: "baz" },
    ]);
    expect(result).toBe("bar baz foo");
  });

  it("throws and leaves content unchanged if any change fails", () => {
    expect(() =>
      applyChanges("Hello world", [
        { target: { text: "Hello", occurrence: 1 }, replacement: "Hi" },
        { target: { text: "nonexistent", occurrence: 1 }, replacement: "X" },
      ]),
    ).toThrow('target.text "nonexistent" not found in document');
  });
});

describe("applyChange — large document benchmark", () => {
  it("completes replacement in <500ms on a ~10MB document", () => {
    const chunk = "The Licensee agrees to the terms and conditions. ";
    const repeat = Math.ceil((10 * 1024 * 1024) / chunk.length);
    const content = chunk.repeat(repeat);

    const start = performance.now();
    const result = applyChange(content, "Licensee", 1, "Client");
    const elapsed = performance.now() - start;

    expect(result.startsWith("The Client agrees")).toBe(true);
    expect(elapsed).toBeLessThan(500);
  });
});
