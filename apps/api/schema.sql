-- Spec 121/178 schema (Cloud SQL). Runtime tests use the in-memory store.
-- Apply this when DATABASE_URL points at Postgres.
CREATE TABLE IF NOT EXISTS users (
  google_sub TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  wrap JSONB,
  recovery_wrap JSONB,
  wrap_rev INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_sub TEXT NOT NULL REFERENCES users (google_sub),
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS entities (
  user_sub TEXT NOT NULL REFERENCES users (google_sub),
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  rev INTEGER NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  blob BYTEA,
  PRIMARY KEY (user_sub, kind, id)
);
