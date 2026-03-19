'use strict';

/**
 * Google Sheets integration service.
 *
 * Reads spreadsheet data and returns rows as objects.
 *
 * Required env vars:
 *   GOOGLE_APPLICATION_CREDENTIALS  — path to service account JSON key
 *   GOOGLE_SHEETS_COPY_ID           — spreadsheet ID for residential/commercial copy
 *   GOOGLE_SHEETS_SEO_ID            — spreadsheet ID for SEO content (optional, can be same sheet)
 *
 * Expected sheet format (row 1 = headers):
 *   page | key | value | type
 *   e.g.:
 *   residential | hero_title      | Power Your Home.   | text
 *   residential | hero_subtitle   | Clean energy for…  | text
 *   commercial  | hero_title      | Enterprise EV…     | text
 *   seo         | residential_title | Home EV Charging | text
 */

async function getSheetsClient() {
  const { google } = require('googleapis');
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set');

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Read all rows from a sheet tab.
 * Returns an array of objects keyed by the first-row headers.
 *
 * @param {string} spreadsheetId
 * @param {string} [tabName='Sheet1']
 * @returns {Promise<Array<{page,key,value,type}>>}
 */
async function readSheet(spreadsheetId, tabName = 'Sheet1') {
  const sheets = await getSheetsClient();
  const range  = `${tabName}!A:Z`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1)
    .filter(row => row.some(cell => cell && cell.trim()))   // skip blank rows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
      return obj;
    });
}

/**
 * List all tab names in a spreadsheet.
 * @param {string} spreadsheetId
 * @returns {Promise<string[]>}
 */
async function listTabs(spreadsheetId) {
  const sheets = await getSheetsClient();
  const meta   = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' });
  return (meta.data.sheets || []).map(s => s.properties.title);
}

/**
 * Read ALL tabs in a spreadsheet and merge rows into one array.
 * Useful when each tab is a page/section.
 *
 * @param {string} spreadsheetId
 * @param {object} [opts]
 * @param {boolean} [opts.tabAsPage=false] — if true, use tab name as the `page` value for rows that lack one
 */
async function readAllTabs(spreadsheetId, { tabAsPage = false } = {}) {
  const tabs = await listTabs(spreadsheetId);
  const all  = [];

  for (const tab of tabs) {
    const rows = await readSheet(spreadsheetId, tab);
    rows.forEach(row => {
      if (tabAsPage && !row.page) row.page = tab.toLowerCase().replace(/\s+/g, '_');
      all.push(row);
    });
  }

  return all;
}

module.exports = { readSheet, readAllTabs, listTabs };
