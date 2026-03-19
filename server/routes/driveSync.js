'use strict';

/**
 * Google Drive → Hero Image Sync
 *
 * POST /api/drive/sync
 *   Scans GOOGLE_DRIVE_FOLDER_ID (or the folder you seeded: 1QMFOVwZAGQp-aaZKHyXh34l2gTSgzPNw)
 *   Downloads image files named after product slugs and updates the heroes table.
 *
 * GET  /api/drive/list
 *   Returns file listing from the Drive folder.
 *
 * POST /api/drive/assign
 *   Manually map a Drive file ID to a hero slug.
 *   Body: { fileId, heroSlug }
 *
 * Setup:
 *   1. npm install googleapis
 *   2. Create a Google Cloud service account with Drive API enabled
 *   3. Download the JSON key → server/google-service-account.json
 *   4. Share the Drive folder (1QMFOVwZAGQp-aaZKHyXh34l2gTSgzPNw) with the service account email
 *   5. Set GOOGLE_APPLICATION_CREDENTIALS=./server/google-service-account.json in .env
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { v4: uuid }       = require('uuid');
const { getDb }          = require('../db/database');
const { requireAuth }    = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR  = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads');
const FOLDER_ID   = process.env.GOOGLE_DRIVE_FOLDER_ID || '1QMFOVwZAGQp-aaZKHyXh34l2gTSgzPNw';

/* ── Helpers ── */
async function getDrive() {
  const { google } = require('googleapis');
  const keyFile    = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) throw new Error('GOOGLE_APPLICATION_CREDENTIALS not configured. See server/routes/driveSync.js for setup instructions.');
  const auth = new google.auth.GoogleAuth({ keyFile, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
  return google.drive({ version: 'v3', auth });
}

/**
 * Slug matcher — maps Drive file names to hero slugs.
 * e.g. "thermal-suite-hero.jpg" → "thermal-suite"
 *      "212 Hero.jpg"           → "212"
 */
function fileNameToSlug(name) {
  const n = name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[\s_]+/g, '-');
  const slugs = ['thermal-suite', '212', 'communal', 'nook', 'cold-plunge', 'commercial', 'about'];
  return slugs.find(s => n.includes(s.replace('°', ''))) || null;
}

/* ── GET /api/drive/list ── */
router.get('/list', requireAuth, async (req, res) => {
  try {
    const drive = await getDrive();
    const resp  = await drive.files.list({
      q:      `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      pageSize: 200,
    });
    res.json({ folderId: FOLDER_ID, files: resp.data.files || [] });
  } catch (err) {
    res.status(500).json({ error: err.message, setup: 'See server/routes/driveSync.js for setup instructions.' });
  }
});

/* ── POST /api/drive/sync ── */
router.post('/sync', requireAuth, async (req, res) => {
  const results = { downloaded: [], skipped: [], errors: [] };

  try {
    const drive = await getDrive();
    const resp  = await drive.files.list({
      q:      `'${FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType)',
      pageSize: 200,
    });

    const files = resp.data.files || [];
    const db    = getDb();
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    for (const file of files) {
      const slug = fileNameToSlug(file.name);
      if (!slug) { results.skipped.push(file.name); continue; }

      try {
        // Download
        const ext      = path.extname(file.name) || '.jpg';
        const filename = `np-${slug}-hero${ext}`;
        const destPath = path.join(UPLOAD_DIR, filename);
        const url      = `/uploads/${filename}`;

        const dlRes = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' });
        await new Promise((resolve, reject) => {
          const ws = fs.createWriteStream(destPath);
          dlRes.data.pipe(ws);
          ws.on('finish', resolve);
          ws.on('error', reject);
        });

        // Update hero record
        db.prepare(`UPDATE heroes SET background_image = ? WHERE slug = ?`).run(url, slug);

        // Also update vehicles/products table
        db.prepare(`UPDATE vehicles SET hero_image = ? WHERE slug = ?`).run(url, slug);

        // Register in media library
        const size = fs.statSync(destPath).size;
        db.prepare(`
          INSERT OR REPLACE INTO media (id, filename, original_name, mime_type, size, url, source, drive_id, alt_text)
          VALUES (?, ?, ?, ?, ?, ?, 'google_drive', ?, ?)
        `).run(uuid(), filename, file.name, file.mimeType, size, url, file.id, `New Primitive ${slug} hero image`);

        results.downloaded.push({ file: file.name, slug, url });
      } catch (err) {
        results.errors.push({ file: file.name, error: err.message });
      }
    }

    res.json({ success: true, folderId: FOLDER_ID, ...results });
  } catch (err) {
    res.status(500).json({ error: err.message, setup: 'Ensure Google service account credentials are configured.' });
  }
});

/* ── POST /api/drive/assign ── */
router.post('/assign', requireAuth, async (req, res) => {
  const { fileId, heroSlug } = req.body;
  if (!fileId || !heroSlug) return res.status(400).json({ error: 'fileId and heroSlug required' });

  try {
    const drive = await getDrive();

    // Get file metadata
    const meta = await drive.files.get({ fileId, fields: 'id,name,mimeType' });
    const { name, mimeType } = meta.data;

    // Download
    const ext      = path.extname(name) || '.jpg';
    const filename = `np-${heroSlug}-hero${ext}`;
    const destPath = path.join(UPLOAD_DIR, filename);
    const url      = `/uploads/${filename}`;

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const dlRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(destPath);
      dlRes.data.pipe(ws);
      ws.on('finish', resolve);
      ws.on('error', reject);
    });

    const db   = getDb();
    const size = fs.statSync(destPath).size;

    db.prepare(`UPDATE heroes  SET background_image = ? WHERE slug = ?`).run(url, heroSlug);
    db.prepare(`UPDATE vehicles SET hero_image = ? WHERE slug = ?`).run(url, heroSlug);
    db.prepare(`
      INSERT OR REPLACE INTO media (id, filename, original_name, mime_type, size, url, source, drive_id, alt_text)
      VALUES (?, ?, ?, ?, ?, ?, 'google_drive', ?, ?)
    `).run(uuid(), filename, name, mimeType, size, url, fileId, `New Primitive ${heroSlug}`);

    res.json({ success: true, heroSlug, url, originalName: name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
