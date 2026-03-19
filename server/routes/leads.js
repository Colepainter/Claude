'use strict';

const express = require('express');
const { v4: uuid } = require('uuid');
const { getDb }    = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* POST /api/leads — public, anyone can submit */
router.post('/', (req, res) => {
  const { email, address, type, notes } = req.body;
  if (!email || !type) return res.status(400).json({ error: 'email and type are required' });

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const db = getDb();
  const id = uuid();
  db.prepare('INSERT INTO leads (id, email, address, type, notes) VALUES (?,?,?,?,?)').run(id, email, address || null, type, notes || null);

  res.status(201).json({ id, message: 'Lead captured' });
});

/* GET /api/leads — CMS: list leads */
router.get('/', requireAuth, (req, res) => {
  const db     = getDb();
  const status = req.query.status;
  const limit  = parseInt(req.query.limit)  || 50;
  const offset = parseInt(req.query.offset) || 0;

  const leads = status
    ? db.prepare('SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(status, limit, offset)
    : db.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

  const total = status
    ? db.prepare('SELECT COUNT(*) as n FROM leads WHERE status = ?').get(status).n
    : db.prepare('SELECT COUNT(*) as n FROM leads').get().n;

  res.json({ leads, total });
});

/* PATCH /api/leads/:id — update status */
router.patch('/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'closed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const db   = getDb();
  const info = db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Lead not found' });

  res.json({ success: true });
});

/* DELETE /api/leads/:id */
router.delete('/:id', requireAuth, (req, res) => {
  const db   = getDb();
  const info = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true });
});

/* GET /api/chargers — placeholder (integrate real API in production) */
// Placed here for simplicity; would move to its own route file at scale
router.get('/chargers', (req, res) => {
  // Mock response — replace with real Supercharger API or your own data
  res.json({
    locations: [
      { name: 'Downtown Supercharger', address: '123 Main St, New York, NY', stalls: 24, power_kw: 250 },
      { name: 'Westside Mall',         address: '456 Park Ave, Los Angeles, CA', stalls: 16, power_kw: 250 },
      { name: 'Airport Plaza',         address: '789 Airport Blvd, Chicago, IL', stalls: 12, power_kw: 150 },
    ]
  });
});

module.exports = router;
