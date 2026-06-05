-- ============================================================================
-- Supabase setup for Violet's Roadmap — run ONCE.
--
-- HOW TO RUN:
--   1. Open your Supabase project → SQL Editor → New query.
--   2. Paste this whole file in and click "Run".
--   3. That's it. The app talks to these two tables through Vercel's server
--      functions (the secret service-role key never touches the browser).
--
-- WHAT IT MAKES:
--   app_state  — all the small data (tasks, writing, achievements, savings…),
--                one row per saved key, value stored as JSON.
--   app_files  — uploaded résumés, letters, and documents (the file itself,
--                base64-encoded, plus its name/type).
--
-- Re-running is safe: the tables are only created if they don't already exist.
-- ============================================================================

create table if not exists app_state (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

create table if not exists app_files (
  blob_id    text primary key,
  name       text,
  type       text,
  data       text,            -- base64 data URL of the file
  size       integer,
  created_at timestamptz default now()
);

-- These tables are reached ONLY through the server-side service-role key, which
-- bypasses Row-Level Security, so no RLS policies are required. We still enable
-- RLS with no public policies so the public/anon key can never read them.
alter table app_state enable row level security;
alter table app_files enable row level security;
