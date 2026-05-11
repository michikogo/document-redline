import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const documents = db
    .prepare(
      "SELECT id, title, version, updated_at FROM documents ORDER BY updated_at DESC",
    )
    .all();
  res.json(documents);
});

export default router;
