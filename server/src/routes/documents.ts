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

export default router;
