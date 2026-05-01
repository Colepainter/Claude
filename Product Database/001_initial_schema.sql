-- =============================================================================
-- New Primitive CRM — Supabase Schema
-- Migration: 001_initial_schema
-- Based on R&D Council recommendation (14-table architecture)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- HELPER: auto-update updated_at timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. CONTACTS
-- People hub — prospects, leads, clients, partners, vendors
-- =============================================================================
CREATE TABLE contacts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  email             TEXT,
  phone             TEXT,
  contact_type      TEXT NOT NULL DEFAULT 'Prospect'
                    CHECK (contact_type IN ('Prospect','Lead','Client','Partner','Vendor','Referral')),
  prospect_stage    TEXT
                    CHECK (prospect_stage IN ('Identified','Outreach Sent','Engaged','Consult Booked')),
  source            TEXT,  -- Instagram, Referral, Google, etc.
  referral_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  tags              TEXT[],
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_referral ON contacts(referral_contact_id);

-- =============================================================================
-- 2. COMPANIES
-- B2B / developer / commercial accounts (optional, linked from contacts)
-- =============================================================================
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  type         TEXT CHECK (type IN ('Developer','Commercial','HOA','Government','Other')),
  website      TEXT,
  industry     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_companies_name ON companies(name);

-- Add company FK to contacts
ALTER TABLE contacts ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX idx_contacts_company ON contacts(company_id);

-- =============================================================================
-- 3. PRODUCTS (catalog)
-- Saunas, cold plunges, additions — the buildable catalog
-- =============================================================================
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  sku               TEXT UNIQUE,
  product_type      TEXT NOT NULL CHECK (product_type IN ('Manufactured','Kit','Plans-Only','Commercial','Add-On')),
  category          TEXT,  -- Sauna, Cold Plunge, Cabin, etc.
  base_price        NUMERIC(10,2),
  description       TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  default_build_partner_id UUID,  -- FK added after build_partners table
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_is_active ON products(is_active);

-- =============================================================================
-- 4. PRODUCT_VARIANTS
-- Sizes, finishes, material options, add-ons per product
-- =============================================================================
CREATE TABLE product_variants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type    TEXT NOT NULL,  -- 'Size', 'Finish', 'Material', 'Add-On', 'Upgrade'
  name            TEXT NOT NULL,
  sku_suffix      TEXT,
  price_delta     NUMERIC(10,2) DEFAULT 0,  -- addition to base price
  dimensions_json JSONB,  -- {width, depth, height, sqft}
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_type ON product_variants(variant_type);

-- =============================================================================
-- 5. BUILD_PARTNERS
-- Qontrast and any future fulfillment partners
-- =============================================================================
CREATE TABLE build_partners (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  contact_name   TEXT,
  email          TEXT,
  phone          TEXT,
  region         TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now add the FK on products
ALTER TABLE products ADD CONSTRAINT fk_products_build_partner
  FOREIGN KEY (default_build_partner_id) REFERENCES build_partners(id) ON DELETE SET NULL;
CREATE INDEX idx_products_build_partner ON products(default_build_partner_id);

-- =============================================================================
-- 6. PROJECTS
-- Central record — one per deal/installation, anchors the full lifecycle
-- =============================================================================
CREATE TABLE projects (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id          UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Pipeline (sales)
  pipeline_stage      TEXT NOT NULL DEFAULT 'Inquiry'
                      CHECK (pipeline_stage IN (
                        'Inquiry','Consult Booked','Consult Complete',
                        'Estimate Sent','Estimate Approved',
                        'Contract Signed','Deposit Received'
                      )),

  -- Operational status (post-sale)
  project_status      TEXT
                      CHECK (project_status IN (
                        'In Production','Site Survey Scheduled',
                        'Site Survey Complete','Delivery Scheduled',
                        'Installed','Complete'
                      )),

  -- Fulfillment type (drives which pipeline steps apply)
  fulfillment_type    TEXT NOT NULL DEFAULT 'Manufactured'
                      CHECK (fulfillment_type IN ('Manufactured','Kit','Plans-Only','Commercial')),

  project_name        TEXT,
  install_address     TEXT,
  install_city        TEXT,
  install_state       TEXT DEFAULT 'UT',
  install_zip         TEXT,

  -- Key dates
  consult_date        DATE,
  contract_signed_date DATE,
  deposit_date        DATE,
  estimated_install_date DATE,
  actual_install_date DATE,

  deal_value          NUMERIC(10,2),
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_contact ON projects(contact_id);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_pipeline_stage ON projects(pipeline_stage);
CREATE INDEX idx_projects_project_status ON projects(project_status);
CREATE INDEX idx_projects_is_active ON projects(is_active);

-- =============================================================================
-- 7. ESTIMATES
-- Line-item quotes linked to a project
-- =============================================================================
CREATE TABLE estimates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'Draft'
                  CHECK (status IN ('Draft','Sent','Approved','Declined','Superseded')),
  subtotal        NUMERIC(10,2),
  discount        NUMERIC(10,2) DEFAULT 0,
  tax             NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2),
  sent_date       DATE,
  approved_date   DATE,
  notes           TEXT,
  line_items      JSONB,  -- [{product_id, variant_id, qty, unit_price, description}]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_estimates_status ON estimates(status);

-- =============================================================================
-- 8. SITE_SURVEYS
-- Pre-install site assessment — gates Qontrast handoff
-- =============================================================================
CREATE TABLE site_surveys (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'Scheduled'
                      CHECK (status IN ('Scheduled','Complete','Approved','Issues Found','Cancelled')),
  survey_date         DATE,
  surveyor_name       TEXT,

  -- Site conditions
  access_notes        TEXT,
  electrical_notes    TEXT,
  foundation_notes    TEXT,
  drainage_notes      TEXT,
  clearance_notes     TEXT,
  photos_url          TEXT,  -- link to Google Drive / storage

  -- Dimensions
  site_width_ft       NUMERIC(6,2),
  site_depth_ft       NUMERIC(6,2),
  slope_notes         TEXT,

  approval_date       DATE,
  approved_by         TEXT,
  issues              TEXT,
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_site_surveys_project ON site_surveys(project_id);
CREATE INDEX idx_site_surveys_status ON site_surveys(status);

-- =============================================================================
-- 9. BUILD_ORDERS
-- Handoff to Qontrast (or any partner) — created after site survey approved
-- =============================================================================
CREATE TABLE build_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  build_partner_id  UUID NOT NULL REFERENCES build_partners(id) ON DELETE RESTRICT,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,

  status            TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN (
                      'Pending','Submitted','In Production',
                      'Quality Check','Ready to Ship','Shipped',
                      'Delivered','Installed','Complete','On Hold','Cancelled'
                    )),

  po_number         TEXT UNIQUE,
  submitted_date    DATE,
  estimated_completion DATE,
  actual_completion DATE,
  ship_date         DATE,
  delivery_date     DATE,

  -- Selected configuration
  selected_variants JSONB,  -- [{variant_id, variant_type, name}]

  partner_notes     TEXT,
  internal_notes    TEXT,
  total_cost        NUMERIC(10,2),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_build_orders_project ON build_orders(project_id);
CREATE INDEX idx_build_orders_partner ON build_orders(build_partner_id);
CREATE INDEX idx_build_orders_status ON build_orders(status);

-- =============================================================================
-- 10. CHANGE_ORDERS
-- Scope changes after contract/build order is issued
-- =============================================================================
CREATE TABLE change_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  build_order_id  UUID REFERENCES build_orders(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Approved','Declined','Completed')),
  description     TEXT NOT NULL,
  price_delta     NUMERIC(10,2) DEFAULT 0,
  requested_date  DATE,
  approved_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_change_orders_project ON change_orders(project_id);
CREATE INDEX idx_change_orders_build_order ON change_orders(build_order_id);

-- =============================================================================
-- 11. TOUCHPOINTS
-- Every meaningful contact event — call, email, DM, site visit, etc.
-- Highest-leverage table: gives full relationship timeline
-- =============================================================================
CREATE TABLE touchpoints (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  type          TEXT NOT NULL
                CHECK (type IN (
                  'Email','Call','Text','DM','Consult','Site Visit',
                  'Proposal Sent','Contract Sent','Follow-Up','Note','Other'
                )),
  direction     TEXT CHECK (direction IN ('Inbound','Outbound','Internal')),
  subject       TEXT,
  body          TEXT,
  happened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    TEXT DEFAULT 'Claude',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_touchpoints_contact ON touchpoints(contact_id);
CREATE INDEX idx_touchpoints_project ON touchpoints(project_id);
CREATE INDEX idx_touchpoints_type ON touchpoints(type);
CREATE INDEX idx_touchpoints_happened_at ON touchpoints(happened_at DESC);

-- =============================================================================
-- 12. TASKS
-- Internal action items tied to contacts or projects
-- =============================================================================
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'Open'
                CHECK (status IN ('Open','In Progress','Done','Cancelled')),
  priority      TEXT DEFAULT 'Normal'
                CHECK (priority IN ('Low','Normal','High','Urgent')),
  due_date      DATE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to   TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_contact ON tasks(contact_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =============================================================================
-- 13. NETWORK
-- Referral sources, trade partners, influencers — relationship capital
-- =============================================================================
CREATE TABLE network (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id        UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,  -- can be org name or person name
  type              TEXT CHECK (type IN (
                      'Referral Partner','Trade Partner','Influencer',
                      'Past Client','Community','Vendor','Other'
                    )),
  relationship_strength TEXT CHECK (relationship_strength IN ('Weak','Moderate','Strong')),
  referrals_sent    INTEGER DEFAULT 0,
  referrals_closed  INTEGER DEFAULT 0,
  last_contact_date DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_network_contact ON network(contact_id);
CREATE INDEX idx_network_type ON network(type);

-- =============================================================================
-- 14. REVIEWS
-- NPS / testimonials with referral attribution
-- =============================================================================
CREATE TABLE reviews (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
  contact_id          UUID REFERENCES contacts(id) ON DELETE SET NULL,
  nps_score           INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  rating              INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text         TEXT,
  platform            TEXT CHECK (platform IN ('Google','Houzz','Yelp','Facebook','Internal','Other')),
  review_date         DATE,
  referral_generated  BOOLEAN DEFAULT FALSE,
  referred_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  is_published        BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_contact ON reviews(contact_id);
CREATE INDEX idx_reviews_nps ON reviews(nps_score);

-- =============================================================================
-- AUTO-UPDATE TRIGGERS (updated_at on all tables)
-- =============================================================================
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_product_variants_updated BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_build_partners_updated BEFORE UPDATE ON build_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_estimates_updated BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_site_surveys_updated BEFORE UPDATE ON site_surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_build_orders_updated BEFORE UPDATE ON build_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_change_orders_updated BEFORE UPDATE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_network_updated BEFORE UPDATE ON network
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (permissive to start — tighten per use case)
-- =============================================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE network ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Permissive policies (full access for now — lock down when adding auth)
CREATE POLICY "allow_all_contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_product_variants" ON product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_build_partners" ON build_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_estimates" ON estimates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_site_surveys" ON site_surveys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_build_orders" ON build_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_change_orders" ON change_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_touchpoints" ON touchpoints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_network" ON network FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED: Default build partner
-- =============================================================================
INSERT INTO build_partners (name, contact_name, region, is_active)
VALUES ('Qontrast', NULL, 'Utah', TRUE);

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
