-- =============================================================================
-- New Primitive CRM — Schema
-- Migration: 005_proposal_document_layer
-- Extends `estimates` with the customer-facing proposal-document layer:
--   - Human-readable proposal number (e.g. NP-2026-001)
--   - Validity window (default 30 days)
--   - Rendered PDF URL
--   - Configurator share-link captured at draft time
--   - Brand-voice "experience narrative" (Cole-authored — §2 of the proposal)
--   - Follow-up cadence state (drives the +0/+3/+10/+21/+30 SOP)
-- Consumer: exploration-proposal-generator skill.
-- Run AFTER 004_quickbooks_linkage.sql
-- =============================================================================

-- All NP CRM objects live in the `np_crm` schema. See 001 for context.
SET search_path TO np_crm, public, extensions;

ALTER TABLE estimates
  ADD COLUMN proposal_number          TEXT UNIQUE,
  ADD COLUMN valid_until              DATE,
  ADD COLUMN proposal_pdf_url         TEXT,
  ADD COLUMN configurator_share_url   TEXT,
  ADD COLUMN experience_narrative     TEXT,
  ADD COLUMN follow_up_state          TEXT
    CHECK (follow_up_state IN (
      'Draft',
      'Sent',
      'Check-In 3d',
      'Check-In 10d',
      'Final Ask 21d',
      'Expired',
      'Won',
      'Lost',
      'Nurture'
    )),
  ADD COLUMN follow_up_next_action_at TIMESTAMPTZ,
  ADD COLUMN payment_deposit_pct      NUMERIC(5,2),
  ADD COLUMN payment_milestones_json  JSONB;

CREATE INDEX idx_estimates_proposal_number       ON estimates(proposal_number);
CREATE INDEX idx_estimates_follow_up_state       ON estimates(follow_up_state);
CREATE INDEX idx_estimates_follow_up_next_action ON estimates(follow_up_next_action_at)
  WHERE follow_up_next_action_at IS NOT NULL;

COMMENT ON COLUMN estimates.proposal_number IS
  'Human-readable proposal number shown to the customer (e.g. NP-2026-001). Distinct from id (UUID) and quickbooks_estimate_id.';
COMMENT ON COLUMN estimates.experience_narrative IS
  'Section 2 of the proposal — Cole writes this in his own brand voice. Do NOT generate; leave a placeholder for Cole.';
COMMENT ON COLUMN estimates.follow_up_state IS
  'Where this proposal is in the +0/+3/+10/+21/+30 cadence. ''Won''/''Lost''/''Expired'' are terminal.';
COMMENT ON COLUMN estimates.payment_milestones_json IS
  'Schedule e.g. [{"label":"Deposit","pct":30,"due":"on signing"},{"label":"Fab start","pct":40,"due":"on production start"},...]';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
