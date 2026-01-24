-- Leads Command Center Database Schema
-- Run this in Supabase SQL Editor to set up the required tables

-- ============================================
-- TABLE: job_presets
-- Stores saved CLI flag configurations for reuse
-- ============================================
CREATE TABLE IF NOT EXISTS job_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  params JSONB NOT NULL,                   -- CLI flags configuration
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: jobs
-- Stores scraping job metadata and status
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  params JSONB NOT NULL,                   -- All CLI flags stored as JSON
  queries TEXT[] NOT NULL,                 -- Input search queries
  preset_id UUID REFERENCES job_presets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  result_count INTEGER DEFAULT 0
);

-- ============================================
-- TABLE: lead_notes
-- User notes attached to individual leads
-- ============================================
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_cid TEXT NOT NULL,                  -- References scraped lead by Google CID
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: lead_tags
-- Tags for categorizing leads
-- ============================================
CREATE TABLE IF NOT EXISTS lead_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_cid TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_cid, tag)
);

-- ============================================
-- TABLE: lead_status
-- CRM status for each lead (new, contacted, qualified, closed)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_status (
  lead_cid TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  follow_up_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_cid ON lead_notes(lead_cid);
CREATE INDEX IF NOT EXISTS idx_lead_tags_cid ON lead_tags(lead_cid);
CREATE INDEX IF NOT EXISTS idx_lead_tags_tag ON lead_tags(tag);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_presets_updated_at
    BEFORE UPDATE ON job_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at
    BEFORE UPDATE ON lead_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_status_updated_at
    BEFORE UPDATE ON lead_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTE: The 'results' table is created by the scraper
-- when you run it with the -dsn flag. No need to create it here.
-- ============================================
