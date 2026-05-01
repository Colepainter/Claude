-- =============================================================================
-- New Primitive CRM — Schema
-- Migration: 004_quickbooks_linkage
-- Establishes Option A: this DB is source-of-truth for pricing; QuickBooks is
-- the invoicing/accounting layer. Adds reference IDs so estimates can be pushed
-- into QB and reconciled, without QB driving the price list.
-- Run AFTER 003_product_assets.sql
-- =============================================================================

-- All NP CRM objects live in the `np_crm` schema. See 001 for context.
SET search_path TO np_crm, public, extensions;

-- Products map to QuickBooks Items (Service / Product / Bundle).
ALTER TABLE products
  ADD COLUMN quickbooks_item_id   TEXT,
  ADD COLUMN quickbooks_synced_at TIMESTAMPTZ;
CREATE INDEX idx_products_quickbooks_item_id ON products(quickbooks_item_id);

-- Variants can carry their own QB Item references (finish upcharges, accessories).
ALTER TABLE product_variants
  ADD COLUMN quickbooks_item_id   TEXT,
  ADD COLUMN quickbooks_synced_at TIMESTAMPTZ;
CREATE INDEX idx_product_variants_quickbooks_item_id ON product_variants(quickbooks_item_id);

-- Estimates push into QB as Estimates; capture the QB id for reconciliation.
ALTER TABLE estimates
  ADD COLUMN quickbooks_estimate_id TEXT,
  ADD COLUMN quickbooks_synced_at   TIMESTAMPTZ;
CREATE INDEX idx_estimates_quickbooks_estimate_id ON estimates(quickbooks_estimate_id);

COMMENT ON COLUMN products.quickbooks_item_id IS
  'QuickBooks Item ID. DB is source-of-truth for price; QB receives line items at invoice time.';
COMMENT ON COLUMN estimates.quickbooks_estimate_id IS
  'QuickBooks Estimate ID once this row has been pushed into QB. NULL until synced.';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
