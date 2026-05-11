import { Router, Request, Response, NextFunction } from "express";
import db from "../db";
import { AppError } from "../middleware/errorHandler";
import { applyChanges, Change } from "../services/changeService";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const documents = db
    .prepare(
      "SELECT id, title, version, updated_at FROM documents ORDER BY updated_at DESC",
    )
    .all();
  res.json(documents);
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const doc = db
    .prepare(
      "SELECT id, title, content, version, created_at, updated_at FROM documents WHERE id = ?",
    )
    .get(req.params.id);

  if (!doc) return next(new AppError(404, "Document not found"));
  res.json(doc);
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title || !content)
    return next(new AppError(400, "title and content are required"));

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.prepare(
    "INSERT INTO documents (id, title, content, version, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)",
  ).run(id, title, content, now, now);

  const doc = db
    .prepare(
      "SELECT id, title, content, version, created_at, updated_at FROM documents WHERE id = ?",
    )
    .get(id);

  res.status(201).json(doc);
});

router.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
  const { changes } = req.body as { changes?: unknown[] };

  if (!Array.isArray(changes) || changes.length === 0)
    return next(new AppError(400, "changes must be a non-empty array"));

  const doc = db
    .prepare(
      "SELECT id, title, content, version, created_at, updated_at FROM documents WHERE id = ?",
    )
    .get(req.params.id) as
    | {
        id: string;
        title: string;
        content: string;
        version: number;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!doc) return next(new AppError(404, "Document not found"));

  const parsed: Change[] = [];
  for (const c of changes) {
    const change = c as Record<string, unknown>;
    if (change.operation !== "replace")
      return next(new AppError(400, 'operation must be "replace"'));
    const target = change.target as Record<string, unknown> | undefined;
    if (
      !target ||
      typeof target.text !== "string" ||
      !target.text ||
      typeof target.occurrence !== "number"
    )
      return next(
        new AppError(
          400,
          "each change must have target.text and target.occurrence",
        ),
      );
    if (typeof change.replacement !== "string")
      return next(new AppError(400, "replacement must be a string"));
    parsed.push({
      target: { text: target.text, occurrence: target.occurrence },
      replacement: change.replacement,
    });
  }

  let newContent: string;
  try {
    newContent = applyChanges(doc.content, parsed);
  } catch (err) {
    return next(new AppError(400, (err as Error).message));
  }

  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(
      "UPDATE documents SET content = ?, version = version + 1, updated_at = ? WHERE id = ?",
    ).run(newContent, now, doc.id);

    const insertChange = db.prepare(
      "INSERT INTO changes (id, document_id, target_text, occurrence, replacement, applied_at) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const c of parsed) {
      insertChange.run(
        crypto.randomUUID(),
        doc.id,
        c.target.text,
        c.target.occurrence,
        c.replacement,
        now,
      );
    }
  })();

  const updated = db
    .prepare(
      "SELECT id, title, content, version, created_at, updated_at FROM documents WHERE id = ?",
    )
    .get(doc.id);

  res.json(updated);
});

router.get(
  "/:id/changes",
  (req: Request, res: Response, next: NextFunction) => {
    const doc = db
      .prepare("SELECT id FROM documents WHERE id = ?")
      .get(req.params.id);

    if (!doc) return next(new AppError(404, "Document not found"));

    const changes = db
      .prepare(
        "SELECT id, document_id, target_text, occurrence, replacement, applied_at FROM changes WHERE document_id = ? ORDER BY applied_at ASC",
      )
      .all(req.params.id);

    res.json(changes);
  },
);

export default router;
