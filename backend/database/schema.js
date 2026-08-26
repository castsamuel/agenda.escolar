export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, school_year TEXT,
  grade TEXT, class_name TEXT, shift TEXT, is_selected INTEGER DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, school_id INTEGER, name TEXT NOT NULL,
  teacher TEXT, description TEXT, color TEXT DEFAULT '#6D5CE7',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, school_id INTEGER, subject_id INTEGER,
  title TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('dever','trabalho','prova','evento')),
  description TEXT, due_date TEXT NOT NULL, due_time TEXT, priority TEXT DEFAULT 'media',
  status TEXT DEFAULT 'pendente', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, subject_id INTEGER, title TEXT NOT NULL,
  score REAL NOT NULL, max_score REAL NOT NULL DEFAULT 10, date TEXT, period TEXT, notes TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS activities_user_date ON activities(user_id, due_date);
`;

