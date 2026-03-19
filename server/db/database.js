'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ev_primitive.sqlite');

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? null : null });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run schema on first boot
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  return db;
}

module.exports = { getDb };
