'use strict';

/**
 * Google Sheets → Content Blocks Sync
 *
 * GET  /api/sheets/tabs?sheet=copy         List tab names in a spreadsheet
 * GET  /api/sheets/preview?sheet=copy&tab= Preview rows without writing to DB
 * POST /api/sheets/sync                    Sync all sheets → content_blocks table
 *
 * sheet param: "copy" | "seo"  (maps to GOOGLE_SHEETS_COPY_ID / GOOGLE_SHEETS_SEO_ID)
 *
 * Expected spreadsheet format — row 1 is headers:
 *   page  |  key  |  value  |  type
 *
 * Tab-as-page mode: if your sheet has no "page" column, set tabAsPage=true
 * in the POST body and each tab name becomes the page identifier.
 *
 * Examples of what gets written to content_blocks:
 *   page=residential, key=hero_title,    value="Power Your Home"
 *   page=commercial,  key=hero_subtitle, value="Fleet charging made simple"
 *   page=seo,         key=residential_meta_title, value="Home EV Charging | EV Primitive"
 */

const express = require('express');
const { v4: uuid }     = require('uuid');
const { getDb }        = require('../db/database');
const { requireAuth }  = require('../middleware/auth');
const { readSheet, readAllTabs, listTabs } = require('../services/googleSheets');

const router = express.Router();

/* ── Resolve sheet ID from shorthand ── */
function resolveSheetId(sheet) {
  if (!sheet || sheet === 'copy') {
    const id = process.env.GOOGLE_SHEETS_COPY_ID;
    if (!id) throw Object.assign(new Error('GOOGLE_SHEETS_COPY_ID is not set in .env'), { status: 503 });
    return id;
  }
  if (sheet === 'seo') {
    const id = process.env.GOOGLE_SHEETS_SEO_ID || process.env.GOOGLE_SHEETS_COPY_ID;
    if (!id) throw Object.assign(new Error('GOOGLE_SHEETS_SEO_ID is not set in .env'), { status: 503 });
    return id;
  }
  // Accept a raw spreadsheet ID too
  if (sheet.length > 20) return sheet;
  throw Object.assign(new Error(`Unknown sheet: "${sheet}". Use "copy", "seo", or a spreadsheet ID.`), { status: 400 });
}

/* ── GET /api/sheets/tabs ── */
router.get('/tabs', requireAuth, async (req, res) => {
  try {
    const id   = resolveSheetId(req.query.sheet);
    const tabs = await listTabs(id);
    res.json({ spreadsheetId: id, tabs });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

/* ── GET /api/sheets/preview ── */
router.get('/preview', requireAuth, async (req, res) => {
  try {
    const id         = resolveSheetId(req.query.sheet);
    const tab        = req.query.tab;
    const tabAsPage  = req.query.tabAsPage === 'true';

    const rows = tab
      ? await readSheet(id, tab)
      : await readAllTabs(id, { tabAsPage });

    res.json({ spreadsheetId: id, tab: tab || '(all)', count: rows.length, rows });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

/* ── POST /api/sheets/sync ── */
router.post('/sync', requireAuth, async (req, res) => {
  const {
    sheet      = 'copy',   // "copy" | "seo" | raw spreadsheet ID
    tab        = null,     // specific tab, or null = all tabs
    tabAsPage  = false,    // use tab name as page when row has no "page" column
    dryRun     = false,    // if true, returns changes without writing
  } = req.body;

  const results = { upserted: [], skipped: [], errors: [] };

  try {
    const id = resolveSheetId(sheet);

    const rows = tab
      ? await readSheet(id, tab)
      : await readAllTabs(id, { tabAsPage });

    const db    = getDb();
    const upsert = db.prepare(`
      INSERT INTO content_blocks (id, page, key, value, type)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(page, key) DO UPDATE SET
        value      = excluded.value,
        type       = excluded.type,
        updated_at = datetime('now')
    `);

    const syncAll = db.transaction(() => {
      for (const row of rows) {
        const page  = (row.page  || '').toLowerCase().trim();
        const key   = (row.key   || '').toLowerCase().trim().replace(/\s+/g, '_');
        const value = row.value  || '';
        const type  = row.type   || 'text';

        if (!page || !key) {
          results.skipped.push({ row, reason: 'missing page or key' });
          continue;
        }

        if (!dryRun) {
          upsert.run(uuid(), page, key, value, type);
        }

        results.upserted.push({ page, key, type, preview: value.slice(0, 80) });
      }
    });

    syncAll();

    res.json({
      success: true,
      spreadsheetId: id,
      dryRun: !!dryRun,
      summary: {
        upserted: results.upserted.length,
        skipped:  results.skipped.length,
        errors:   results.errors.length,
      },
      ...results,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

/* ── POST /api/sheets/sync-all ── */
// Convenience: sync both copy + SEO sheets in one call
router.post('/sync-all', requireAuth, async (req, res) => {
  const { tabAsPage = false, dryRun = false } = req.body;

  const sheets  = ['copy', 'seo'].filter(s =>
    s === 'copy' ? !!process.env.GOOGLE_SHEETS_COPY_ID : !!process.env.GOOGLE_SHEETS_SEO_ID
  );

  const combined = { upserted: [], skipped: [], errors: [] };

  for (const sheet of sheets) {
    try {
      const id   = resolveSheetId(sheet);
      const rows = await readAllTabs(id, { tabAsPage });

      const db     = getDb();
      const upsert = db.prepare(`
        INSERT INTO content_blocks (id, page, key, value, type)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(page, key) DO UPDATE SET
          value      = excluded.value,
          type       = excluded.type,
          updated_at = datetime('now')
      `);

      const syncAll = db.transaction(() => {
        for (const row of rows) {
          const page  = (row.page  || '').toLowerCase().trim();
          const key   = (row.key   || '').toLowerCase().trim().replace(/\s+/g, '_');
          const value = row.value  || '';
          const type  = row.type   || 'text';

          if (!page || !key) {
            combined.skipped.push({ sheet, row, reason: 'missing page or key' });
            continue;
          }

          if (!dryRun) upsert.run(uuid(), page, key, value, type);
          combined.upserted.push({ sheet, page, key });
        }
      });

      syncAll();
    } catch (err) {
      combined.errors.push({ sheet, error: err.message });
    }
  }

  res.json({
    success: combined.errors.length === 0,
    dryRun:  !!dryRun,
    summary: {
      upserted: combined.upserted.length,
      skipped:  combined.skipped.length,
      errors:   combined.errors.length,
    },
    ...combined,
  });
});

module.exports = router;
