-- ============================================
-- Migration: Enable Row Level Security (RLS)
-- Strict policies with user_id for multi-user SaaS
-- ============================================

-- First, add user_id to all tables that need user ownership
-- Note: results table is created by scraper, we'll add user_id separately

-- Add user_id column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to job_presets table
ALTER TABLE job_presets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to lead_notes table  
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to lead_tags table
ALTER TABLE lead_tags ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to lead_status table
ALTER TABLE lead_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create results table if it doesn't exist (scraper usually creates this)
-- Using JSONB data column as scraper does
CREATE TABLE IF NOT EXISTS results (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add user_id to results if table already exists but column doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'results' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE results ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'results' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE results ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Create indexes on user_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_presets_user_id ON job_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_user_id ON lead_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_tags_user_id ON lead_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_user_id ON lead_status(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);

-- Create GIN index on results.data for JSONB queries
CREATE INDEX IF NOT EXISTS idx_results_data ON results USING GIN(data);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STRICT RLS POLICIES
-- Users can only access their own data
-- ============================================

-- Jobs: Users can only see/modify their own jobs
CREATE POLICY "Users can view their own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Job Presets: Users can only manage their own presets
CREATE POLICY "Users can view their own presets"
    ON job_presets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presets"
    ON job_presets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets"
    ON job_presets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets"
    ON job_presets FOR DELETE
    USING (auth.uid() = user_id);

-- Lead Notes: Users can only manage notes they created
CREATE POLICY "Users can view their own notes"
    ON lead_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
    ON lead_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
    ON lead_notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
    ON lead_notes FOR DELETE
    USING (auth.uid() = user_id);

-- Lead Tags: Users can only manage their own tags
CREATE POLICY "Users can view their own tags"
    ON lead_tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
    ON lead_tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON lead_tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON lead_tags FOR DELETE
    USING (auth.uid() = user_id);

-- Lead Status: Users can only manage their own lead statuses
CREATE POLICY "Users can view their own lead statuses"
    ON lead_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead statuses"
    ON lead_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead statuses"
    ON lead_status FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead statuses"
    ON lead_status FOR DELETE
    USING (auth.uid() = user_id);

-- Results (Leads): Users can only view/manage their scraped leads
CREATE POLICY "Users can view their own results"
    ON results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create results"
    ON results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results"
    ON results FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results"
    ON results FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE BYPASS
-- The scraper running via Docker uses SERVICE_ROLE_KEY
-- which automatically bypasses RLS for inserts
-- ============================================

-- Note: When running the scraper with -dsn, use the service role connection string
-- e.g., postgresql://postgres.[project-ref]:[service-role-password]@...
-- The service role always bypasses RLS, allowing the scraper to insert leads

-- ============================================
-- HELPER: Get current user's results count
-- ============================================
CREATE OR REPLACE FUNCTION get_user_results_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM results WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
