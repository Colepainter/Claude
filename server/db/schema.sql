-- ═══════════════════════════════════════════════════════════════
--  EV Primitive — SQLite Schema
-- ═══════════════════════════════════════════════════════════════

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── Admin users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,          -- bcrypt hash
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'editor',  -- admin | editor
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Vehicles ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,   -- model-y, model-3, etc.
  name          TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT,
  base_price    INTEGER NOT NULL,       -- cents
  hero_image    TEXT,                   -- path or Drive URL
  order_idx     INTEGER DEFAULT 0,     -- display order
  published     INTEGER DEFAULT 1,     -- 0=draft, 1=live
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Vehicle stats (range, acceleration, etc.) ──────────────────
CREATE TABLE IF NOT EXISTS vehicle_stats (
  id          TEXT PRIMARY KEY,
  vehicle_id  TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  unit        TEXT,
  order_idx   INTEGER DEFAULT 0
);

-- ─── Vehicle features (feature rows on detail pages) ────────────
CREATE TABLE IF NOT EXISTS vehicle_features (
  id          TEXT PRIMARY KEY,
  vehicle_id  TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  eyebrow     TEXT,
  title       TEXT NOT NULL,
  body        TEXT,
  image       TEXT,
  reversed    INTEGER DEFAULT 0,
  dark        INTEGER DEFAULT 1,
  order_idx   INTEGER DEFAULT 0
);

-- ─── Hero sections (homepage sliders) ───────────────────────────
CREATE TABLE IF NOT EXISTS heroes (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  background_image TEXT,
  cta_primary_label TEXT DEFAULT 'Order Now',
  cta_primary_href  TEXT,
  cta_secondary_label TEXT DEFAULT 'Learn More',
  cta_secondary_href  TEXT,
  order_idx       INTEGER DEFAULT 0,
  published       INTEGER DEFAULT 1
);

-- ─── Hero stats ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_stats (
  id        TEXT PRIMARY KEY,
  hero_id   TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  value     TEXT NOT NULL,
  label     TEXT NOT NULL,
  order_idx INTEGER DEFAULT 0
);

-- ─── Media library ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size        INTEGER,                 -- bytes
  url         TEXT NOT NULL,
  alt_text    TEXT,
  source      TEXT DEFAULT 'upload',  -- upload | google_drive
  drive_id    TEXT,                   -- Google Drive file ID
  uploaded_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Leads / quote requests ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  address     TEXT,
  type        TEXT NOT NULL,           -- solar-quote | test-drive | etc.
  notes       TEXT,
  status      TEXT DEFAULT 'new',      -- new | contacted | closed
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Site settings (key/value) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Page content blocks (for CMS-editable text areas) ──────────
CREATE TABLE IF NOT EXISTS content_blocks (
  id          TEXT PRIMARY KEY,
  page        TEXT NOT NULL,          -- homepage, charging, energy, etc.
  key         TEXT NOT NULL,          -- hero_title, section_body, etc.
  value       TEXT NOT NULL,
  type        TEXT DEFAULT 'text',    -- text | html | image | json
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(page, key)
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vehicles_slug    ON vehicles(slug);
CREATE INDEX IF NOT EXISTS idx_heroes_slug      ON heroes(slug);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_media_source     ON media(source);
CREATE INDEX IF NOT EXISTS idx_content_page_key ON content_blocks(page, key);
