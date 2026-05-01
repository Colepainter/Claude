-- =============================================================================
-- New Primitive CRM — Product Seed
-- Migration: 002_seed_products
-- Confirmed product lineup as of 2026-04-27
-- Run AFTER 001_initial_schema.sql
-- =============================================================================

-- =============================================================================
-- PRODUCTS
-- =============================================================================

INSERT INTO products (id, name, sku, product_type, category, description, is_active)
VALUES
  -- SAUNAS
  (uuid_generate_v4(), 'The Nook',         'NP-NOOK',        'Manufactured', 'Sauna',
   'Compact 2–4 person sauna. Entry-level model. Front or side entry. Designed for residential backyards and smaller lots.',
   TRUE),

  (uuid_generate_v4(), 'The 212',          'NP-212',         'Manufactured', 'Sauna',
   'Full-size 4–6 person flagship sauna. Named for the boiling point. Available with optional L-bench (6–8 person). Front or side entry.',
   TRUE),

  (uuid_generate_v4(), 'Thermal Suite',    'NP-TS',          'Manufactured', 'Sauna + Cold Plunge',
   'Premium wellness structure — sauna and cold plunge under one roof. Standard includes NP Horizon. Designer includes NP Tower.',
   TRUE),

  -- COLD PLUNGE — STANDALONE
  (uuid_generate_v4(), 'NP Horizon',       'NP-HORIZON',     'Manufactured', 'Cold Plunge',
   'Horizontal lay-down cold plunge. Full-body immersive soak in a wide, expansive form factor.',
   TRUE),

  (uuid_generate_v4(), 'NP Tower',         'NP-TOWER',       'Manufactured', 'Cold Plunge',
   'Vertical stand-up cold plunge. Upright full-body cold immersion with a compact footprint.',
   TRUE),

  -- CUSTOM BUILDS
  (uuid_generate_v4(), 'Custom Indoor Sauna + Cold Plunge', 'NP-CUSTOM-INDOOR', 'Commercial', 'Custom',
   'Full custom design and build-out for indoor sauna and cold plunge spaces. Integrated with existing architecture.',
   TRUE),

  (uuid_generate_v4(), 'Custom Outdoor Sauna', 'NP-CUSTOM-OUTDOOR', 'Commercial', 'Custom',
   'Client-specific outdoor sauna build developed through architectural design process. Includes site survey, design review, and Qontrast build coordination.',
   TRUE),

  -- ADD-ONS
  (uuid_generate_v4(), 'Porch-Mounted Shower',    'NP-ADDON-SHOWER',    'Add-On', 'Add-On',
   'Outdoor shower mounted to sauna porch structure. Completes the hot/cold/rinse cycle.',
   TRUE),

  (uuid_generate_v4(), 'Bluetooth Sound System',  'NP-ADDON-AUDIO',     'Add-On', 'Add-On',
   'Integrated Bluetooth audio for the sauna room. Compatible with SaunaLogic 2 system.',
   TRUE),

  (uuid_generate_v4(), 'Wi-Fi Controls (SaunaLogic 2)', 'NP-ADDON-WIFI', 'Add-On', 'Add-On',
   'SaunaLogic 2 remote heater control via mobile app. Pre-heat, set temp (119–194°F), delayed start (up to 24hrs), LED lighting (7 colors).',
   TRUE);

-- =============================================================================
-- PRODUCT VARIANTS — PACKAGE TIERS
-- Applied to all three sauna models (Nook, 212, Thermal Suite)
-- =============================================================================

-- Helper: get product IDs by SKU
DO $$
DECLARE
  nook_id       UUID;
  two12_id      UUID;
  ts_id         UUID;
BEGIN
  SELECT id INTO nook_id  FROM products WHERE sku = 'NP-NOOK';
  SELECT id INTO two12_id FROM products WHERE sku = 'NP-212';
  SELECT id INTO ts_id    FROM products WHERE sku = 'NP-TS';

  -- =========================================================================
  -- ENTRY CONFIGURATION VARIANTS
  -- =========================================================================
  INSERT INTO product_variants (product_id, variant_type, name, sku_suffix, price_delta, notes) VALUES
    (nook_id,  'Configuration', 'Standard — Front Entry', 'STD', 0,    'Default front-entry configuration'),
    (nook_id,  'Configuration', 'Designer — Side Entry',  'DSG', NULL, 'Side-entry configuration — price TBD'),

    (two12_id, 'Configuration', 'Standard — Front Entry, 4–6 Person',          'STD',    0,    'Default front-entry'),
    (two12_id, 'Configuration', 'Designer — Side Entry, 4–6 Person',           'DSG',    NULL, 'Side-entry — price TBD'),
    (two12_id, 'Configuration', 'Standard + L-Bench — Front Entry, 6–8 Person','STD-LB', NULL, 'L-bench adds capacity — price TBD'),
    (two12_id, 'Configuration', 'Designer + L-Bench — Side Entry, 6–8 Person', 'DSG-LB', NULL, 'Side-entry + L-bench — price TBD'),

    (ts_id,    'Configuration', 'Standard — Front Entry Sauna + NP Horizon', 'STD', 0,    'Default Thermal Suite with horizontal plunge'),
    (ts_id,    'Configuration', 'Designer — Side Entry Sauna + NP Tower',    'DSG', NULL, 'Designer Thermal Suite with vertical plunge');

  -- =========================================================================
  -- PACKAGE TIER VARIANTS — EXTERIOR
  -- =========================================================================
  INSERT INTO product_variants (product_id, variant_type, name, sku_suffix, price_delta, notes) VALUES
    -- Nook
    (nook_id, 'Finish', 'Standard — Board & Batten Exterior',   'EXT-STD',  0,    'Default exterior — vertical siding'),
    (nook_id, 'Finish', 'Designer — Charred Wood Exterior',     'EXT-CHR',  NULL, 'Shou Sugi Ban charred finish'),
    (nook_id, 'Finish', 'Designer — Pine Exterior',             'EXT-PIN',  NULL, 'Natural warm tone pine'),
    (nook_id, 'Finish', 'Signature — Ash Exterior',             'EXT-ASH',  NULL, 'Premium hardwood, Signature exclusive'),
    (nook_id, 'Finish', 'Signature — Charred Aqua Exterior',    'EXT-CAQ',  NULL, 'Signature exclusive variant'),

    -- 212
    (two12_id, 'Finish', 'Standard — Board & Batten Exterior',  'EXT-STD',  0,    'Default exterior'),
    (two12_id, 'Finish', 'Designer — Charred Wood Exterior',    'EXT-CHR',  NULL, 'Shou Sugi Ban'),
    (two12_id, 'Finish', 'Designer — Pine Exterior',            'EXT-PIN',  NULL, 'Natural pine'),
    (two12_id, 'Finish', 'Signature — Ash Exterior',            'EXT-ASH',  NULL, 'Signature exclusive'),
    (two12_id, 'Finish', 'Signature — Charred Aqua Exterior',   'EXT-CAQ',  NULL, 'Signature exclusive'),

    -- Thermal Suite
    (ts_id, 'Finish', 'Standard — Board & Batten Exterior',     'EXT-STD',  0,    'Default exterior'),
    (ts_id, 'Finish', 'Designer — Charred Wood Exterior',       'EXT-CHR',  NULL, 'Shou Sugi Ban'),
    (ts_id, 'Finish', 'Designer — Pine Exterior',               'EXT-PIN',  NULL, 'Natural pine'),
    (ts_id, 'Finish', 'Signature — Ash Exterior',               'EXT-ASH',  NULL, 'Signature exclusive'),
    (ts_id, 'Finish', 'Signature — Charred Aqua Exterior',      'EXT-CAQ',  NULL, 'Signature exclusive');

  -- =========================================================================
  -- PACKAGE TIER VARIANTS — INTERIOR WOOD
  -- =========================================================================
  INSERT INTO product_variants (product_id, variant_type, name, sku_suffix, price_delta, notes) VALUES
    -- Nook
    (nook_id, 'Material', 'Standard — Knotty Western Red Cedar Interior',  'INT-KRC', 0,    'Classic sauna wood — aromatic, heat-resistant'),
    (nook_id, 'Material', 'Upgrade — Clear Cedar A-Grade Interior',        'INT-CCA', NULL, 'Knot-free, refined look'),
    (nook_id, 'Material', 'Upgrade — Slatted Clear Cedar Interior',        'INT-SCC', NULL, 'Slatted profile adds depth and airflow'),

    -- 212
    (two12_id, 'Material', 'Standard — Knotty Western Red Cedar Interior', 'INT-KRC', 0,    'Classic sauna wood'),
    (two12_id, 'Material', 'Upgrade — Clear Cedar A-Grade Interior',       'INT-CCA', NULL, 'Knot-free'),
    (two12_id, 'Material', 'Upgrade — Slatted Clear Cedar Interior',       'INT-SCC', NULL, 'Slatted'),

    -- Thermal Suite
    (ts_id, 'Material', 'Standard — Knotty Western Red Cedar Interior',    'INT-KRC', 0,    'Classic sauna wood'),
    (ts_id, 'Material', 'Upgrade — Clear Cedar A-Grade Interior',          'INT-CCA', NULL, 'Knot-free'),
    (ts_id, 'Material', 'Upgrade — Slatted Clear Cedar Interior',          'INT-SCC', NULL, 'Slatted');

  -- =========================================================================
  -- PACKAGE TIER VARIANTS — FLOORING
  -- =========================================================================
  INSERT INTO product_variants (product_id, variant_type, name, sku_suffix, price_delta, notes) VALUES
    -- Nook
    (nook_id, 'Material', 'Standard — Knotty Western Red Cedar Flooring',   'FLR-KRC', 0,    'Standard flooring'),
    (nook_id, 'Material', 'Designer — Thermally Modified Pine Flooring',    'FLR-TMP', NULL, 'Heat-treated, richer tone'),
    (nook_id, 'Material', 'Signature — Thermally Modified Ash Flooring',    'FLR-TMA', NULL, 'Refined grain, max stability'),

    -- 212
    (two12_id, 'Material', 'Standard — Knotty Western Red Cedar Flooring',  'FLR-KRC', 0,    'Standard flooring'),
    (two12_id, 'Material', 'Designer — Thermally Modified Pine Flooring',   'FLR-TMP', NULL, 'Heat-treated'),
    (two12_id, 'Material', 'Signature — Thermally Modified Ash Flooring',   'FLR-TMA', NULL, 'Refined grain'),

    -- Thermal Suite
    (ts_id, 'Material', 'Standard — Knotty Western Red Cedar Flooring',     'FLR-KRC', 0,    'Standard flooring'),
    (ts_id, 'Material', 'Designer — Thermally Modified Pine Flooring',      'FLR-TMP', NULL, 'Heat-treated'),
    (ts_id, 'Material', 'Signature — Thermally Modified Ash Flooring',      'FLR-TMA', NULL, 'Refined grain');

  -- =========================================================================
  -- HEATER VARIANTS
  -- =========================================================================
  INSERT INTO product_variants (product_id, variant_type, name, sku_suffix, price_delta, notes) VALUES
    -- Nook — 6.8kW
    (nook_id, 'Upgrade', 'Finnleo Himalaya SL2 7.0 (6.8kW) — Wall-Mounted', 'HTR-HIM7', 0,
     'ETL approved. Part #1118-70-0207. Max room 350 cu ft. 208–240V. SaunaLogic 2 control.'),

    -- 212 — 9.0kW
    (two12_id, 'Upgrade', 'Finnleo Himalaya SL2 9.0 (9.0kW) — Wall-Mounted', 'HTR-HIM9', 0,
     'ETL approved. Part #1118-90-0207. Max room 500 cu ft. 208–240V. SaunaLogic 2 control.'),

    -- Thermal Suite — 9.0kW
    (ts_id, 'Upgrade', 'Finnleo Himalaya SL2 9.0 (9.0kW) — Wall-Mounted', 'HTR-HIM9', 0,
     'ETL approved. Part #1118-90-0207. Max room 500 cu ft. 208–240V. SaunaLogic 2 control.');

END $$;

-- =============================================================================
-- END OF SEED
-- =============================================================================
