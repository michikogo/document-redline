import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../dev.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS changes (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    target_text TEXT NOT NULL,
    occurrence INTEGER NOT NULL,
    replacement TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`);

export default db;
