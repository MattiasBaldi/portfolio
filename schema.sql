CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  project_slug TEXT NOT NULL,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  uploaded_at TEXT DEFAULT (datetime('now'))
);
