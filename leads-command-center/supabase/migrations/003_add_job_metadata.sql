-- ============================================
-- Migration: Add Job Metadata to Results
-- Enables linking leads to specific jobs for progress tracking
-- ============================================

-- Add job_id column to results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE CASCADE;

-- Create index on job_id for fast progress counting
CREATE INDEX IF NOT EXISTS idx_results_job_id ON results(job_id);

-- Note: RLS policies on 'results' rely on 'user_id', which is sufficient for security.
-- 'job_id' is primarily for organization and progress tracking.
