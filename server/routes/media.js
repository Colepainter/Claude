'use strict';

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuid }    = require('uuid');
const { getDb }       = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* ─── Multer storage ─── */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '20') * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
    cb(null, allowed.includes(file.mimetype));
  }
});

/* ─── Routes ─── */

/* GET /api/media — list all media */
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const limit  = parseInt(req.query.limit)  || 50;
  const offset = parseInt(req.query.offset) || 0;

  const items = db.prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as n FROM media').get().n;

  res.json({ items, total, limit, offset });
});

/* POST /api/media/upload — file upload */
router.post('/upload', requireAuth, upload.array('files', 20), async (req, res) => {
  const db      = getDb();
  const results = [];

  for (const file of req.files || []) {
    const id  = uuid();
    const url = `/uploads/${file.filename}`;

    // Optional: resize with sharp if it's an image
    try {
      if (file.mimetype.startsWith('image/')) {
        const sharp = require('sharp');
        const tmpPath = file.path + '_resized';
        await sharp(file.path)
          .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(tmpPath);
        fs.renameSync(tmpPath, file.path);
      }
    } catch {
      /* sharp not available — skip optimization */
    }

    db.prepare(`
      INSERT INTO media (id, filename, original_name, mime_type, size, url, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, file.filename, file.originalname, file.mimetype, file.size, url, req.user.id);

    results.push({ id, url, original_name: file.originalname });
  }

  res.status(201).json(results);
});

/* POST /api/media/from-drive — import from Google Drive */
router.post('/from-drive', requireAuth, async (req, res) => {
  const { fileId, altText } = req.body;
  if (!fileId) return res.status(400).json({ error: 'fileId is required' });

  try {
    const driveService = require('../services/googleDrive');
    const result = await driveService.downloadFile(fileId, UPLOAD_DIR);

    const db  = getDb();
    const id  = uuid();
    const url = `/uploads/${result.filename}`;

    db.prepare(`
      INSERT INTO media (id, filename, original_name, mime_type, size, url, alt_text, source, drive_id, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'google_drive', ?, ?)
    `).run(id, result.filename, result.originalName, result.mimeType, result.size, url, altText || null, fileId, req.user.id);

    res.status(201).json({ id, url, original_name: result.originalName });
  } catch (err) {
    res.status(500).json({ error: `Google Drive error: ${err.message}` });
  }
});

/* GET /api/media/drive-folders — list Drive folder contents */
router.get('/drive-folders', requireAuth, async (req, res) => {
  const { folderId } = req.query;
  try {
    const driveService = require('../services/googleDrive');
    const files = await driveService.listFolder(folderId || process.env.GOOGLE_DRIVE_FOLDER_ID);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: `Drive error: ${err.message}` });
  }
});

/* PUT /api/media/:id — update alt text */
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { altText } = req.body;
  db.prepare('UPDATE media SET alt_text = ? WHERE id = ?').run(altText || null, req.params.id);
  res.json({ success: true });
});

/* DELETE /api/media/:id */
router.delete('/:id', requireAuth, (req, res) => {
  const db    = getDb();
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  // Delete file from disk
  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, media.filename));
  } catch { /* already gone */ }

  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
