'use strict';

const express = require('express');
const { v4: uuid } = require('uuid');
const { getDb }    = require('../db/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* ─── Helpers ─── */
function getVehicleFull(db, vehicleOrSlug) {
  const vehicle = typeof vehicleOrSlug === 'string'
    ? db.prepare('SELECT * FROM vehicles WHERE slug = ? AND published = 1').get(vehicleOrSlug)
    : vehicleOrSlug;

  if (!vehicle) return null;

  const stats    = db.prepare('SELECT * FROM vehicle_stats WHERE vehicle_id = ? ORDER BY order_idx').all(vehicle.id);
  const features = db.prepare('SELECT * FROM vehicle_features WHERE vehicle_id = ? ORDER BY order_idx').all(vehicle.id);

  return {
    ...vehicle,
    base_price: vehicle.base_price / 100,  // cents → dollars for frontend
    stats,
    features
  };
}

/* ─── Public routes ─── */

/* GET /api/vehicles — list all published vehicles */
router.get('/', (req, res) => {
  const db       = getDb();
  const vehicles = db.prepare('SELECT * FROM vehicles WHERE published = 1 ORDER BY order_idx').all();
  const result   = vehicles.map(v => getVehicleFull(db, v));
  res.json(result);
});

/* GET /api/vehicles/:slug */
router.get('/:slug', (req, res) => {
  const db      = getDb();
  const vehicle = getVehicleFull(db, req.params.slug);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

/* ─── CMS / authenticated routes ─── */

/* POST /api/vehicles — create */
router.post('/', requireAuth, (req, res) => {
  const { name, slug, tagline, description, base_price, hero_image, order_idx } = req.body;

  if (!name || !slug || !base_price) {
    return res.status(400).json({ error: 'name, slug, and base_price are required' });
  }

  const db = getDb();
  const id = uuid();

  try {
    db.prepare(`
      INSERT INTO vehicles (id, slug, name, tagline, description, base_price, hero_image, order_idx)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, slug, name, tagline || null, description || null, Math.round(base_price * 100), hero_image || null, order_idx || 0);

    res.status(201).json({ id, slug, name });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    throw err;
  }
});

/* PUT /api/vehicles/:id — update */
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const v  = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });

  const { name, tagline, description, base_price, hero_image, order_idx, published } = req.body;

  db.prepare(`
    UPDATE vehicles SET
      name = ?, tagline = ?, description = ?, base_price = ?, hero_image = ?,
      order_idx = ?, published = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name        ?? v.name,
    tagline     ?? v.tagline,
    description ?? v.description,
    base_price  != null ? Math.round(base_price * 100) : v.base_price,
    hero_image  ?? v.hero_image,
    order_idx   ?? v.order_idx,
    published   != null ? (published ? 1 : 0) : v.published,
    req.params.id
  );

  res.json({ success: true });
});

/* DELETE /api/vehicles/:id — admin only */
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
  res.json({ success: true });
});

/* ─── Stats sub-resource ─── */

/* GET /api/vehicles/:slug/stats */
router.get('/:slug/stats', (req, res) => {
  const db = getDb();
  const v  = db.prepare('SELECT id FROM vehicles WHERE slug = ?').get(req.params.slug);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });
  const stats = db.prepare('SELECT * FROM vehicle_stats WHERE vehicle_id = ? ORDER BY order_idx').all(v.id);
  res.json(stats);
});

/* POST /api/vehicles/:slug/stats */
router.post('/:slug/stats', requireAuth, (req, res) => {
  const db = getDb();
  const v  = db.prepare('SELECT id FROM vehicles WHERE slug = ?').get(req.params.slug);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });

  const { value, label, unit, order_idx } = req.body;
  if (!value || !label) return res.status(400).json({ error: 'value and label required' });

  const id = uuid();
  db.prepare('INSERT INTO vehicle_stats (id, vehicle_id, value, label, unit, order_idx) VALUES (?,?,?,?,?,?)').run(id, v.id, value, label, unit || '', order_idx || 0);
  res.status(201).json({ id, value, label });
});

/* DELETE /api/vehicles/stats/:statId */
router.delete('/stats/:statId', requireAuth, (req, res) => {
  const db   = getDb();
  const info = db.prepare('DELETE FROM vehicle_stats WHERE id = ?').run(req.params.statId);
  if (info.changes === 0) return res.status(404).json({ error: 'Stat not found' });
  res.json({ success: true });
});

module.exports = router;
