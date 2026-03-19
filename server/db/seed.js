/* ═══════════════════════════════════════════════════════════════
   New Primitive — Seed Script
   Run once: node server/db/seed.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config({ path: '.env' });

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { getDb }    = require('./database');

const db = getDb();

/* ─── Admin user ─── */
const adminId = uuid();
const hash    = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);

db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password, name, role)
  VALUES (?, ?, ?, 'Admin', 'admin')
`).run(adminId, process.env.ADMIN_EMAIL || 'admin@newprimitive.co', hash);

/* ─── Products ─── */
const products = [
  {
    id: uuid(), slug: 'thermal-suite', name: 'Thermal Suite',
    tagline: 'Sauna & Cold Plunge in One Beautifully Enclosed Sanctuary',
    description: 'A fully integrated sauna and cold plunge system designed for consistent temperature control, clean water, and long-term performance — crafted as a complete contrast therapy destination.',
    base_price: 0, // quote-based
    hero_image: '/images/thermal-suite-hero.jpg', order_idx: 1
  },
  {
    id: uuid(), slug: '212', name: '212°',
    tagline: 'Built for Shared Rituals & Intentional Gatherings',
    description: 'Designed for shared rituals and intentional gatherings, the 212° offers the full spectrum of traditional dry sauna benefits in a sophisticated open layout. Comfortably seating 6–8 people.',
    base_price: 0,
    hero_image: '/images/212-hero.jpg', order_idx: 2
  },
  {
    id: uuid(), slug: 'communal', name: 'Communal',
    tagline: 'Where Heat Meets Connection',
    description: 'Large-format, fully customizable communal wellness space. Ideal for retreats, hotels, and shared wellness facilities. Designed entirely to specification.',
    base_price: 0,
    hero_image: '/images/communal-hero.jpg', order_idx: 3
  },
  {
    id: uuid(), slug: 'nook', name: 'The Nook',
    tagline: 'Wellness Tailored for Closeness',
    description: 'Perfect for smaller spaces or private escapes, the Nook delivers an elevated wellness routine in a conveniently efficient footprint. Ideal for couples or the individual seeker.',
    base_price: 0,
    hero_image: '/images/nook-hero.jpg', order_idx: 4
  },
  {
    id: uuid(), slug: 'cold-plunge', name: 'NP 32° Cold Plunge',
    tagline: 'Focused Cold Therapy. Complete Rejuvenation.',
    description: 'A self-regulated standalone cold therapy system. Integrates cleanly into any indoor or outdoor environment. The perfect companion to any New Primitive sauna.',
    base_price: 0,
    hero_image: '/images/cold-plunge-hero.jpg', order_idx: 5
  }
];

const insProduct = db.prepare(`
  INSERT OR IGNORE INTO vehicles (id, slug, name, tagline, description, base_price, hero_image, order_idx)
  VALUES (@id, @slug, @name, @tagline, @description, @base_price, @hero_image, @order_idx)
`);

const insStats = db.prepare(`
  INSERT OR IGNORE INTO vehicle_stats (id, vehicle_id, label, value, unit, order_idx)
  VALUES (@id, @vehicle_id, @label, @value, @unit, @order_idx)
`);

const productStats = {
  'thermal-suite': [
    ['4–6', 'Seats', ''],
    ['9kW', 'IKI Heater', ''],
    ['175–212', 'Temp (°F)', ''],
    ['~8 wks', 'Lead Time', '']
  ],
  '212': [
    ['6–8', 'Seats', ''],
    ['9kW', 'IKI Heater', ''],
    ['12\'3"', 'Length', ''],
    ['175–212°', 'Temp Range', '']
  ],
  'communal': [
    ['8+', 'Capacity', ''],
    ['Custom', 'Layout', ''],
    ['Cedar', 'Interiors', '']
  ],
  'nook': [
    ['2–4', 'Seats', ''],
    ['HUUM Drop', 'Heater', ''],
    ['55 kg', 'Stone Load', ''],
    ['WiFi', 'Remote Start', '']
  ],
  'cold-plunge': [
    ['32°F', 'Min Temp', ''],
    ['Self', 'Regulated', ''],
    ['In/Out', 'Door Ready', '']
  ]
};

const seedProducts = db.transaction(() => {
  for (const p of products) {
    insProduct.run(p);
    const stats = productStats[p.slug] || [];
    stats.forEach(([value, label, unit], i) => {
      insStats.run({ id: uuid(), vehicle_id: p.id, value, label, unit, order_idx: i });
    });
  }
});
seedProducts();

/* ─── Hero sections ─── */
const insHero = db.prepare(`
  INSERT OR IGNORE INTO heroes (id, slug, title, subtitle, background_image, cta_primary_href, cta_secondary_href, order_idx)
  VALUES (@id, @slug, @title, @subtitle, @background_image, @cta_primary_href, @cta_secondary_href, @order_idx)
`);
const insHeroStat = db.prepare(`
  INSERT OR IGNORE INTO hero_stats (id, hero_id, value, label, order_idx)
  VALUES (@id, @hero_id, @value, @label, @order_idx)
`);

const heroRows = [
  { slug:'thermal-suite', title:'Thermal Suite', subtitle:'Sauna & Cold Plunge in One Sanctuary',
    bg:'/images/thermal-suite-hero.jpg', ph:'/pages/thermal-suite.html', sh:'/pages/contact.html', idx:1 },
  { slug:'212',           title:'212°',          subtitle:'Built for Shared Rituals & Intentional Gatherings',
    bg:'/images/212-hero.jpg',           ph:'/pages/212.html',           sh:'/pages/contact.html', idx:2 },
  { slug:'nook',          title:'The Nook',      subtitle:'Your Private Wellness Escape',
    bg:'/images/nook-hero.jpg',          ph:'/pages/nook.html',          sh:'/pages/contact.html', idx:3 },
  { slug:'communal',      title:'Communal',      subtitle:'Where Heat Meets Connection',
    bg:'/images/communal-hero.jpg',      ph:'/pages/communal.html',      sh:'/pages/contact.html', idx:4 },
  { slug:'cold-plunge',   title:'NP 32° Cold Plunge', subtitle:'Focused Cold Therapy. Complete Rejuvenation.',
    bg:'/images/cold-plunge-hero.jpg',   ph:'/pages/cold-plunge.html',   sh:'/pages/contact.html', idx:5 },
  { slug:'commercial',    title:'Commercial',    subtitle:'Hotels. Spas. Performance Facilities.',
    bg:'/images/commercial-hero.jpg',    ph:'/pages/commercial.html',    sh:'/pages/contact.html', idx:6 },
];

const heroStatRows = {
  'thermal-suite': [['4–6','Seats'],['9kW','IKI Heater'],['212°','Max Temp']],
  '212':           [['6–8','Seats'],['175–212°','Temp Range'],['8 wks','Lead Time']],
  'nook':          [['2–4','Seats'],['HUUM','Drop 9kW'],['WiFi','Remote Start']],
  'cold-plunge':   [['32°F','Min Temp'],['Self','Regulated'],['In/Out','Door Ready']],
};

const seedHeroes = db.transaction(() => {
  for (const h of heroRows) {
    const id = uuid();
    insHero.run({ id, slug: h.slug, title: h.title, subtitle: h.subtitle,
                  background_image: h.bg, cta_primary_href: h.ph, cta_secondary_href: h.sh, order_idx: h.idx });
    (heroStatRows[h.slug] || []).forEach(([value, label], i) => {
      insHeroStat.run({ id: uuid(), hero_id: id, value, label, order_idx: i });
    });
  }
});
seedHeroes();

/* ─── Default settings ─── */
const setSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`);
setSetting.run('site_name',           'New Primitive');
setSetting.run('accent_color',        '#2d5a3d');   // forest green — NP brand color
setSetting.run('show_quote_cta',      '1');
setSetting.run('drive_folder_id',     '1QMFOVwZAGQp-aaZKHyXh34l2gTSgzPNw');
setSetting.run('tagline',             'Born in Utah\'s Mountains. Delivered Ready.');

console.log('✅  New Primitive database seeded successfully');
process.exit(0);
