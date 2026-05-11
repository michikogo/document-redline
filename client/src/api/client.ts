export type DocumentSummary = {
  id: string;
  title: string;
  version: number;
  updated_at: string;
};

export type Document = DocumentSummary & {
  content: string;
  created_at: string;
};

export type Change = {
  id: string;
  document_id: string;
  target_text: string;
  occurrence: number;
  replacement: string;
  applied_at: string;
};

export type ChangeRequest = {
  operation: "replace";
  target: { text: string; occurrence: number };
  replacement: string;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
};

export const getDocuments = () => request<DocumentSummary[]>("/api/documents");

export const getDocument = (id: string) =>
  request<Document>(`/api/documents/${id}`);

export const createDocument = (title: string, content: string) =>
  request<Document>("/api/documents", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });

export const applyChanges = (id: string, changes: ChangeRequest[]) =>
  request<Document>(`/api/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ changes }),
  });

export const getChanges = (id: string) =>
  request<Change[]>(`/api/documents/${id}/changes`);

export type SearchResult = {
  document_id: string;
  title: string;
  snippets: string[];
};

export const searchDocuments = (q: string, limit = 10, offset = 0) =>
  request<SearchResult[]>(
    `/api/documents/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
  );

export const searchDocument = (id: string, q: string) =>
  request<SearchResult>(
    `/api/documents/${id}/search?q=${encodeURIComponent(q)}`,
  );
