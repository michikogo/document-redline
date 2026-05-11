import { Router, Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import db, { sqlite } from "../db";
import { documents, changes } from "../schema";
import { AppError } from "../middleware/errorHandler";
import { applyChanges, Change } from "../services/changeService";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const docs = db
    .select({
      id: documents.id,
      title: documents.title,
      version: documents.version,
      updated_at: documents.updated_at,
    })
    .from(documents)
    .orderBy(documents.updated_at)
    .all();
  res.json(docs);
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const doc = db
    .select()
    .from(documents)
    .where(eq(documents.id, req.params.id))
    .get();

  if (!doc) return next(new AppError(404, "Document not found"));
  res.json(doc);
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title || !content)
    return next(new AppError(400, "title and content are required"));

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.insert(documents)
    .values({
      id,
      title,
      content,
      version: 1,
      created_at: now,
      updated_at: now,
    })
    .run();

  const doc = db.select().from(documents).where(eq(documents.id, id)).get();

  res.status(201).json(doc);
});

router.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
  const { changes: rawChanges } = req.body as { changes?: unknown[] };

  if (!Array.isArray(rawChanges) || rawChanges.length === 0)
    return next(new AppError(400, "changes must be a non-empty array"));

  const doc = db
    .select()
    .from(documents)
    .where(eq(documents.id, req.params.id))
    .get();

  if (!doc) return next(new AppError(404, "Document not found"));

  const parsed: Change[] = [];
  for (const c of rawChanges) {
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

  sqlite.transaction(() => {
    db.update(documents)
      .set({ content: newContent, version: doc.version + 1, updated_at: now })
      .where(eq(documents.id, doc.id))
      .run();

    for (const c of parsed) {
      db.insert(changes)
        .values({
          id: crypto.randomUUID(),
          document_id: doc.id,
          target_text: c.target.text,
          occurrence: c.target.occurrence,
          replacement: c.replacement,
          applied_at: now,
        })
        .run();
    }
  })();

  const updated = db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id))
    .get();

  res.json(updated);
});

router.get(
  "/:id/changes",
  (req: Request, res: Response, next: NextFunction) => {
    const doc = db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.id, req.params.id))
      .get();

    if (!doc) return next(new AppError(404, "Document not found"));

    const log = db
      .select()
      .from(changes)
      .where(eq(changes.document_id, req.params.id))
      .orderBy(desc(changes.applied_at))
      .all();

    res.json(log);
  },
);

export default router;
