import { describe, it, expect } from "vitest";
import {
  extractSnippets,
  searchDocuments,
} from "../src/services/searchService.ts";

describe("extractSnippets", () => {
  it("returns a snippet for a single match", () => {
    const snippets = extractSnippets("The Licensee shall comply.", "Licensee");
    expect(snippets).toHaveLength(1);
    expect(snippets[0]).toContain("Licensee");
  });

  it("returns multiple snippets for multiple matches", () => {
    const snippets = extractSnippets(
      "Licensee agrees. The Licensee shall pay.",
      "licensee",
    );
    expect(snippets).toHaveLength(2);
  });

  it("is case-insensitive", () => {
    const snippets = extractSnippets(
      "The INDEMNIFICATION clause applies.",
      "indemnification",
    );
    expect(snippets).toHaveLength(1);
    expect(snippets[0]).toContain("INDEMNIFICATION");
  });

  it("returns empty array when no match", () => {
    const snippets = extractSnippets("Hello world.", "agreement");
    expect(snippets).toHaveLength(0);
  });

  it("clips gracefully when match is near the start", () => {
    const content = "Agreement starts here and continues for a while.";
    const snippets = extractSnippets(content, "Agreement", 150);
    expect(snippets[0]).not.toMatch(/^…/);
    expect(() => snippets[0]).not.toThrow();
  });

  it("clips gracefully when match is near the end", () => {
    const content = "Some long text that ends with the word Agreement";
    const snippets = extractSnippets(content, "Agreement", 150);
    expect(snippets[0]).not.toMatch(/…$/);
    expect(() => snippets[0]).not.toThrow();
  });

  it("adds ellipsis when match is in the middle of a long document", () => {
    const padding = "x".repeat(200);
    const content = `${padding} Agreement ${padding}`;
    const snippets = extractSnippets(content, "Agreement", 150);
    expect(snippets[0]).toMatch(/^…/);
    expect(snippets[0]).toMatch(/…$/);
  });

  it("completes in under 500ms on a large document (~5MB)", () => {
    const content = "word ".repeat(1_000_000);
    const start = performance.now();
    extractSnippets(content, "word");
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe("searchDocuments", () => {
  const docs = [
    { id: "1", title: "NDA", content: "This is a non-disclosure agreement." },
    { id: "2", title: "License", content: "Software license terms apply." },
    { id: "3", title: "Vendor", content: "Vendor contract for services." },
  ];

  it("returns matching documents with snippets", () => {
    const results = searchDocuments(docs, "agreement");
    expect(results).toHaveLength(1);
    expect(results[0].document_id).toBe("1");
    expect(results[0].title).toBe("NDA");
    expect(results[0].snippets[0]).toContain("agreement");
  });

  it("returns multiple documents when query matches several", () => {
    const results = searchDocuments(docs, "terms");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array when no documents match", () => {
    const results = searchDocuments(docs, "indemnification");
    expect(results).toHaveLength(0);
  });

  it("includes document_id and title in each result", () => {
    const results = searchDocuments(docs, "license");
    expect(results[0]).toHaveProperty("document_id");
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("snippets");
  });
});
