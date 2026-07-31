CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL DEFAULT 'daydream',
  session_id TEXT,
  event_type TEXT,
  page_path TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  screen TEXT,
  duration REAL,
  operation TEXT,
  api_status TEXT,
  api_duration REAL,
  model TEXT,
  country TEXT,
  language TEXT,
  referrer TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project ON events(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_event_type ON events(event_type);
