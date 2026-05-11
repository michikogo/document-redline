import { Router, Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import db from "../db";
import { documents } from "../schema";
import { AppError } from "../middleware/errorHandler";
import { extractSnippets, searchDocuments } from "../services/searchService";

const router = Router();

router.get("/search", (req: Request, res: Response, next: NextFunction) => {
  const q = req.query.q as string | undefined;
  if (!q || !q.trim()) return next(new AppError(400, "q is required"));

  const limit = Math.max(
    1,
    parseInt((req.query.limit as string) ?? "10", 10) || 10,
  );
  const offset = Math.max(
    0,
    parseInt((req.query.offset as string) ?? "0", 10) || 0,
  );

  const docs = db
    .select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
    })
    .from(documents)
    .all();

  const results = searchDocuments(docs, q.trim());
  res.json(results.slice(offset, offset + limit));
});

router.get("/:id/search", (req: Request, res: Response, next: NextFunction) => {
  const q = req.query.q as string | undefined;
  if (!q || !q.trim()) return next(new AppError(400, "q is required"));

  const doc = db
    .select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
    })
    .from(documents)
    .where(eq(documents.id, req.params.id))
    .get();

  if (!doc) return next(new AppError(404, "Document not found"));

  res.json({
    document_id: doc.id,
    title: doc.title,
    snippets: extractSnippets(doc.content, q.trim()),
  });
});

export default router;
