'use strict';

require('dotenv').config({ path: '.env' });

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── Middleware ─── */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.SITE_URL].filter(Boolean)
    : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ─── Static files ─── */
// Serve the EV website from project root
app.use(express.static(path.join(__dirname, '../')));
// Serve uploads
app.use('/uploads', express.static(
  process.env.UPLOAD_DIR || path.join(__dirname, '../public/uploads')
));

/* ─── API routes ─── */
const authRoutes     = require('./routes/auth');
const vehicleRoutes  = require('./routes/vehicles');
const contentRoutes  = require('./routes/content');
const mediaRoutes    = require('./routes/media');
const leadRoutes     = require('./routes/leads');

app.use('/api/auth',     authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/content',  contentRoutes);
app.use('/api/media',    mediaRoutes);
app.use('/api/leads',    leadRoutes);

// /api/chargers convenience alias
app.get('/api/chargers', (req, res) => {
  res.json({
    locations: [
      { name: 'Downtown Supercharger', address: '123 Main St, New York, NY 10001',         stalls: 24, power_kw: 250 },
      { name: 'Westside Mall Station', address: '456 Park Ave, Los Angeles, CA 90028',      stalls: 16, power_kw: 250 },
      { name: 'Airport Plaza V3',      address: '789 Airport Blvd, Chicago, IL 60601',      stalls: 12, power_kw: 250 },
      { name: 'Bay Area Hub',          address: '321 Mission St, San Francisco, CA 94105',  stalls: 20, power_kw: 250 },
      { name: 'South Loop Station',    address: '555 Wacker Dr, Chicago, IL 60606',         stalls: 8,  power_kw: 150 },
    ]
  });
});

/* ─── CMS admin — serve admin dashboard ─── */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

/* ─── Health check ─── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', env: process.env.NODE_ENV || 'development' });
});

/* ─── 404 for unknown API calls ─── */
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route found: ${req.method} ${req.path}` });
});

/* ─── SPA fallback — serve index.html for all other routes ─── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

/* ─── Global error handler ─── */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

/* ─── Start ─── */
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  EV Primitive server running             ║
║  http://localhost:${PORT}                    ║
║  Admin: http://localhost:${PORT}/admin        ║
║  API:   http://localhost:${PORT}/api          ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
