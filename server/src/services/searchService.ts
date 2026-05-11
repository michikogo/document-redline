export type SearchResult = {
  document_id: string;
  title: string;
  snippets: string[];
};

export type DocInput = {
  id: string;
  title: string;
  content: string;
};

export const extractSnippets = (
  content: string,
  query: string,
  contextChars = 150,
): string[] => {
  const lower = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const snippets: string[] = [];
  let searchFrom = 0;

  while (true) {
    const idx = lower.indexOf(lowerQuery, searchFrom);
    if (idx === -1) break;

    const start = Math.max(0, idx - contextChars);
    const end = Math.min(
      content.length,
      idx + lowerQuery.length + contextChars,
    );
    const prefix = start > 0 ? "…" : "";
    const suffix = end < content.length ? "…" : "";

    snippets.push(`${prefix}${content.slice(start, end)}${suffix}`);
    searchFrom = idx + 1;
  }

  return snippets;
};

export const searchDocuments = (
  docs: DocInput[],
  query: string,
): SearchResult[] =>
  docs
    .map((doc) => ({
      document_id: doc.id,
      title: doc.title,
      snippets: extractSnippets(doc.content, query),
    }))
    .filter((result) => result.snippets.length > 0);
