-- ============================================
-- Migration: Add CID column to Results table
-- CID (Customer ID) is Google's unique identifier for businesses
-- Used for deduplication and fast lookups
-- ============================================

-- Add cid column if it doesn't exist
ALTER TABLE results ADD COLUMN IF NOT EXISTS cid TEXT;

-- Create index on cid for fast lookups and deduplication checks
CREATE INDEX IF NOT EXISTS idx_results_cid ON results(cid);

-- Create unique constraint on user_id + cid to prevent duplicate leads per user
-- Note: Using a partial index to allow NULL cids during migration
CREATE UNIQUE INDEX IF NOT EXISTS idx_results_user_cid_unique 
    ON results(user_id, cid) 
    WHERE cid IS NOT NULL;
