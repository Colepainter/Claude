/* ═══════════════════════════════════════════════════════════════
   Seed Script — run once: node server/db/seed.js
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
`).run(adminId, process.env.ADMIN_EMAIL || 'admin@evprimitive.com', hash);

/* ─── Vehicles ─── */
const vehicles = [
  {
    id: uuid(), slug: 'model-y',    name: 'Model Y',    base_price: 4399000,
    tagline: 'Best-Selling EV in the World', order_idx: 1,
    hero_image: '/images/model-y-hero.jpg'
  },
  {
    id: uuid(), slug: 'model-3',    name: 'Model 3',    base_price: 4024000,
    tagline: 'The Standard for Electric Sedans', order_idx: 2,
    hero_image: '/images/model-3-hero.jpg'
  },
  {
    id: uuid(), slug: 'model-s',    name: 'Model S',    base_price: 7499000,
    tagline: 'The Pinnacle of Performance', order_idx: 3,
    hero_image: '/images/model-s-hero.jpg'
  },
  {
    id: uuid(), slug: 'model-x',    name: 'Model X',    base_price: 7999000,
    tagline: 'The Safest SUV Ever Built', order_idx: 4,
    hero_image: '/images/model-x-hero.jpg'
  },
  {
    id: uuid(), slug: 'cybertruck', name: 'Cybertruck', base_price: 6099000,
    tagline: 'Built for Utility. Engineered for Power.', order_idx: 5,
    hero_image: '/images/cybertruck-hero.jpg'
  }
];

const insVehicle = db.prepare(`
  INSERT OR IGNORE INTO vehicles (id, slug, name, tagline, base_price, hero_image, order_idx)
  VALUES (@id, @slug, @name, @tagline, @base_price, @hero_image, @order_idx)
`);

const insStats = db.prepare(`
  INSERT OR IGNORE INTO vehicle_stats (id, vehicle_id, label, value, unit, order_idx)
  VALUES (@id, @vehicle_id, @label, @value, @unit, @order_idx)
`);

const vehicleStats = {
  'model-y':    [['330','mi Range','mi'], ['3.5s','0–60 mph','s'], ['7','Seats',''], ['AWD','Dual Motor','']],
  'model-3':    [['358','mi Range','mi'], ['3.1s','0–60 mph','s'], ['5','Seats',''], ['AWD','Dual Motor','']],
  'model-s':    [['405','mi Range','mi'], ['1.99s','0–60 mph','s'], ['1,020','Horsepower','hp']],
  'model-x':    [['348','mi Range','mi'], ['2.5s','0–60 mph','s'], ['7','Seats','']],
  'cybertruck': [['320+','mi Range','mi'], ['2.6s','0–60 mph','s'], ['11,000','lb Towing','lb']]
};

const seedAll = db.transaction(() => {
  for (const v of vehicles) {
    insVehicle.run(v);
    const stats = vehicleStats[v.slug] || [];
    stats.forEach(([value, label, unit], i) => {
      insStats.run({ id: uuid(), vehicle_id: v.id, value, label, unit, order_idx: i });
    });
  }
});

seedAll();

/* ─── Heroes ─── */
const insHero  = db.prepare(`INSERT OR IGNORE INTO heroes (id,slug,title,subtitle,background_image,cta_primary_href,cta_secondary_href,order_idx) VALUES (@id,@slug,@title,@subtitle,@background_image,@cta_primary_href,@cta_secondary_href,@order_idx)`);
const insHeroStat = db.prepare(`INSERT OR IGNORE INTO hero_stats (id,hero_id,value,label,order_idx) VALUES (@id,@hero_id,@value,@label,@order_idx)`);

const heroRows = [
  { slug:'model-y',    title:'Model Y',    subtitle:'Best-Selling EV in the World',       bg:'/images/model-y-hero.jpg',    ph:'/pages/model-y.html',    sh:'/pages/model-y.html#learn',    idx:1 },
  { slug:'model-3',    title:'Model 3',    subtitle:'The Standard for Electric Sedans',    bg:'/images/model-3-hero.jpg',    ph:'/pages/model-3.html',    sh:'/pages/model-3.html#learn',    idx:2 },
  { slug:'model-s',    title:'Model S',    subtitle:'The Pinnacle of Performance',         bg:'/images/model-s-hero.jpg',    ph:'/pages/model-s.html',    sh:'/pages/model-s.html#learn',    idx:3 },
  { slug:'model-x',    title:'Model X',    subtitle:'The Safest SUV Ever Built',           bg:'/images/model-x-hero.jpg',    ph:'/pages/model-x.html',    sh:'/pages/model-x.html#learn',    idx:4 },
  { slug:'cybertruck', title:'Cybertruck', subtitle:'Built for Utility. Engineered for Power.', bg:'/images/cybertruck-hero.jpg', ph:'/pages/cybertruck.html', sh:'/pages/cybertruck.html#learn', idx:5 },
  { slug:'solar',      title:'Solar Panels', subtitle:'Power Your Home with Clean Energy', bg:'/images/solar-hero.jpg',      ph:'/pages/energy.html',     sh:'/pages/energy.html#learn',     idx:6 },
];

const seedHeroes = db.transaction(() => {
  for (const h of heroRows) {
    const id = uuid();
    insHero.run({ id, slug: h.slug, title: h.title, subtitle: h.subtitle, background_image: h.bg, cta_primary_href: h.ph, cta_secondary_href: h.sh, order_idx: h.idx });
  }
});
seedHeroes();

/* ─── Default settings ─── */
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`).run('site_name', 'EV Primitive');
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`).run('accent_color', '#3e6ae1');
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`).run('show_federal_credit', '1');

console.log('✅  Database seeded successfully');
process.exit(0);
