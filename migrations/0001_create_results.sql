CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  survival_score INTEGER NOT NULL,
  reproduction_score INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  dominant_axis TEXT NOT NULL,
  result_type TEXT NOT NULL,
  gender TEXT NOT NULL,
  answers TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_results_result_type ON results(result_type);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at);
