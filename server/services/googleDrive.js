'use strict';

/**
 * Google Drive integration service.
 *
 * Requires:
 *   1. A Google Cloud service account with Drive API enabled.
 *   2. The service account JSON key at GOOGLE_APPLICATION_CREDENTIALS.
 *   3. The target Drive folder shared with the service account email.
 *
 * Install the client: npm install googleapis
 */

const path = require('path');
const fs   = require('fs');

async function getDriveClient() {
  const { google } = require('googleapis');

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set');

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * List files in a Drive folder.
 * @param {string} folderId
 */
async function listFolder(folderId) {
  if (!folderId) throw new Error('folderId is required');

  const drive = await getDriveClient();
  const res   = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
    pageSize: 100
  });

  return res.data.files || [];
}

/**
 * Download a Drive file to local disk.
 * @param {string} fileId
 * @param {string} destDir
 * @returns {{ filename, originalName, mimeType, size }}
 */
async function downloadFile(fileId, destDir) {
  const drive = await getDriveClient();

  // Get file metadata
  const meta = await drive.files.get({ fileId, fields: 'id,name,mimeType,size' });
  const { name: originalName, mimeType } = meta.data;

  const ext      = path.extname(originalName) || '.bin';
  const filename = `drive_${fileId.slice(0, 8)}${ext}`;
  const destPath = path.join(destDir, filename);

  // Stream download
  const dlRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(destPath);
    dlRes.data.pipe(ws);
    ws.on('finish', resolve);
    ws.on('error', reject);
  });

  const size = fs.statSync(destPath).size;
  return { filename, originalName, mimeType, size };
}

module.exports = { listFolder, downloadFile };
