-- =============================================================================
-- New Primitive CRM — Schema
-- Migration: 003_product_assets
-- Adds asset paths (renders, GLBs, brochure PDFs, plan-set sheets) per product.
-- Consumers: exploration-proposal-generator skill (renders for §4 of proposal),
-- np-plan-set skill (5-sheet drawing inputs), NP 3D configurator (GLB + textures).
-- Run AFTER 002_seed_products.sql
-- =============================================================================

-- All NP CRM objects live in the `np_crm` schema. See 001 for context.
SET search_path TO np_crm, public, extensions;

CREATE TABLE product_assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id    UUID REFERENCES product_variants(id) ON DELETE CASCADE,
                -- NULL = applies to the product overall (e.g. base GLB);
                -- non-NULL = asset is variant-specific (e.g. a finish-specific texture).

  asset_type    TEXT NOT NULL CHECK (asset_type IN (
                  'Render',              -- rendered image (PNG/JPG)
                  'GLB',                 -- 3D model for configurator
                  'Texture',             -- PBR texture set (KTX2 / WebP)
                  'Brochure PDF',        -- marketing brochure
                  'Plan Set Sheet',      -- np-plan-set sheet output
                  'Spec Sheet',          -- one-page spec
                  'Configurator Preview',-- screenshot from configurator
                  'Material Sample',     -- swatch image
                  'Floor Plan',
                  'Section',
                  'Elevation'
                )),

  label         TEXT,                  -- 'Hero 3/4', 'Interior', 'Charred Cedar', etc.
  url           TEXT NOT NULL,         -- canonical location (Drive / Vercel Blob / Supabase Storage)
  thumbnail_url TEXT,
  width_px      INTEGER,
  height_px     INTEGER,
  bytes         BIGINT,
  mime_type     TEXT,
  sort_order    INTEGER DEFAULT 0,
  is_primary    BOOLEAN DEFAULT FALSE, -- one primary per (product, asset_type)
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_assets_product       ON product_assets(product_id);
CREATE INDEX idx_product_assets_variant       ON product_assets(variant_id);
CREATE INDEX idx_product_assets_type          ON product_assets(asset_type);
CREATE INDEX idx_product_assets_primary       ON product_assets(product_id, asset_type)
  WHERE is_primary = TRUE;

-- One primary asset per (product, asset_type) — avoid ambiguity when the
-- proposal generator asks "give me the hero render for this product".
CREATE UNIQUE INDEX uniq_product_assets_primary
  ON product_assets(product_id, asset_type)
  WHERE is_primary = TRUE AND variant_id IS NULL;

CREATE TRIGGER trg_product_assets_updated BEFORE UPDATE ON product_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_product_assets" ON product_assets FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
