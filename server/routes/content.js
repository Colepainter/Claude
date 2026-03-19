'use strict';

const express = require('express');
const { v4: uuid } = require('uuid');
const { getDb }    = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* ─── Heroes ─── */

/* GET /api/content/heroes */
router.get('/heroes', (req, res) => {
  const db    = getDb();
  const heroes = db.prepare('SELECT * FROM heroes WHERE published = 1 ORDER BY order_idx').all();

  const result = heroes.map(h => ({
    ...h,
    stats: db.prepare('SELECT * FROM hero_stats WHERE hero_id = ? ORDER BY order_idx').all(h.id)
  }));

  res.json(result);
});

/* PUT /api/content/heroes/:id */
router.put('/heroes/:id', requireAuth, (req, res) => {
  const db = getDb();
  const h  = db.prepare('SELECT * FROM heroes WHERE id = ?').get(req.params.id);
  if (!h) return res.status(404).json({ error: 'Hero not found' });

  const { title, subtitle, background_image, order_idx, published,
          cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href } = req.body;

  db.prepare(`
    UPDATE heroes SET
      title = ?, subtitle = ?, background_image = ?,
      cta_primary_label = ?, cta_primary_href = ?,
      cta_secondary_label = ?, cta_secondary_href = ?,
      order_idx = ?, published = ?
    WHERE id = ?
  `).run(
    title               ?? h.title,
    subtitle            ?? h.subtitle,
    background_image    ?? h.background_image,
    cta_primary_label   ?? h.cta_primary_label,
    cta_primary_href    ?? h.cta_primary_href,
    cta_secondary_label ?? h.cta_secondary_label,
    cta_secondary_href  ?? h.cta_secondary_href,
    order_idx           ?? h.order_idx,
    published           != null ? (published ? 1 : 0) : h.published,
    req.params.id
  );

  res.json({ success: true });
});

/* ─── Content blocks ─── */

/* GET /api/content/blocks?page=homepage */
router.get('/blocks', (req, res) => {
  const db   = getDb();
  const page = req.query.page;
  const rows = page
    ? db.prepare('SELECT * FROM content_blocks WHERE page = ?').all(page)
    : db.prepare('SELECT * FROM content_blocks').all();
  res.json(rows);
});

/* PUT /api/content/blocks/:page/:key */
router.put('/blocks/:page/:key', requireAuth, (req, res) => {
  const db    = getDb();
  const { value, type } = req.body;
  const { page, key }   = req.params;

  if (value === undefined) return res.status(400).json({ error: 'value is required' });

  db.prepare(`
    INSERT INTO content_blocks (id, page, key, value, type)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(page, key) DO UPDATE SET
      value      = excluded.value,
      type       = excluded.type,
      updated_at = datetime('now')
  `).run(uuid(), page, key, value, type || 'text');

  res.json({ success: true });
});

/* ─── Settings ─── */

/* GET /api/content/settings */
router.get('/settings', requireAuth, (req, res) => {
  const db   = getDb();
  const rows = db.prepare('SELECT * FROM settings').all();
  const obj  = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(obj);
});

/* PUT /api/content/settings */
router.put('/settings', requireAuth, (req, res) => {
  const db   = getDb();
  const upd  = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  const updateAll = db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      upd.run(key, String(value));
    }
  });
  updateAll();

  res.json({ success: true });
});

module.exports = router;
