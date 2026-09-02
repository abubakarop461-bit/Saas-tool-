-- Cloudflare D1 SQL Schema for Luxe Realty ERP (saas-tool)

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phones TEXT,
  email TEXT,
  lead_source_id TEXT,
  budget_min REAL,
  budget_max REAL,
  preferred_location TEXT,
  property_type TEXT,
  configuration TEXT,
  category TEXT DEFAULT 'Residential',
  transaction_type TEXT DEFAULT 'Outright',
  required_area REAL,
  purpose TEXT,
  assigned_to TEXT,
  stage_id TEXT DEFAULT 'New',
  next_followup_date TEXT,
  status TEXT DEFAULT 'Warm',
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  property_code TEXT UNIQUE,
  location TEXT NOT NULL,
  address TEXT,
  property_type TEXT NOT NULL,
  configuration TEXT NOT NULL,
  carpet_area REAL,
  built_up_area REAL,
  price REAL NOT NULL,
  price_per_sqft REAL,
  maintenance_charge REAL,
  amenities TEXT,
  listing_type TEXT DEFAULT 'Outright',
  status_id TEXT DEFAULT 'Available',
  assigned_agent_id TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  tower TEXT,
  unit_no TEXT,
  is_featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_images (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_visits (
  id TEXT PRIMARY KEY,
  visit_code TEXT UNIQUE,
  lead_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  agent_id TEXT,
  scheduled_date TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled',
  feedback TEXT,
  rating INTEGER,
  visit_type TEXT DEFAULT 'Physical',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  transaction_code TEXT UNIQUE,
  lead_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  deal_value REAL NOT NULL,
  token_amount REAL,
  agreement_date TEXT,
  status TEXT DEFAULT 'In Progress',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS channel_partners (
  id TEXT PRIMARY KEY,
  firm_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  rera_no TEXT,
  tier TEXT DEFAULT 'Silver',
  total_deals INTEGER DEFAULT 0,
  total_commission_paid REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  partner_id TEXT,
  agent_id TEXT,
  commission_type TEXT DEFAULT 'CP',
  percentage REAL NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'SalesAgent',
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  module TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_spend (
  id TEXT PRIMARY KEY,
  company_id TEXT DEFAULT 'default_company',
  lead_source_id TEXT NOT NULL,
  campaign_name TEXT,
  property_id TEXT,
  platform TEXT,
  spend_amount REAL NOT NULL DEFAULT 0,
  period_start TEXT,
  period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_source ON ad_spend(company_id, lead_source_id);
