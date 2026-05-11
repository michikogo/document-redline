import { Router, Request, Response, NextFunction } from "express";
import db from "../db";
import { AppError } from "../middleware/errorHandler";

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

export default router;
