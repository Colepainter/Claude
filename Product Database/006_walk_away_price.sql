-- =============================================================================
-- New Primitive CRM — Schema
-- Migration: 006_walk_away_price
-- Adds the per-product walk-away price floor — the price below which Cole would
-- rather lose the deal than discount. NP-wide default is $30,000 as of
-- 2026-05-01; can be overridden per SKU when product-specific floors emerge.
-- Run AFTER 005_proposal_document_layer.sql
-- =============================================================================

-- All NP CRM objects live in the `np_crm` schema. See 001 for context.
SET search_path TO np_crm, public, extensions;

ALTER TABLE products
  ADD COLUMN walk_away_price NUMERIC(10,2) NOT NULL DEFAULT 30000;

COMMENT ON COLUMN products.walk_away_price IS
  'Price floor — never quote below this. NP-wide default $30,000 (2026-05-01); raise per-product as needed (e.g. Thermal Suite likely higher).';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
