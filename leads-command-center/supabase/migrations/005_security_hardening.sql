-- ============================================
-- Migration: Security Hardening
-- Fixes identified in code review:
-- 1. Add search_path to SECURITY DEFINER functions
-- 2. Clamp result_count to prevent negative values
-- 3. Change ON DELETE CASCADE to SET NULL for results.job_id
-- ============================================

-- Drop and recreate functions with hardened search_path
DROP TRIGGER IF EXISTS trigger_increment_job_result_count ON results;
DROP TRIGGER IF EXISTS trigger_decrement_job_result_count ON results;
DROP FUNCTION IF EXISTS increment_job_result_count();
DROP FUNCTION IF EXISTS decrement_job_result_count();

-- Recreate increment function with hardened search_path
CREATE OR REPLACE FUNCTION increment_job_result_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.job_id IS NOT NULL THEN
        UPDATE jobs
        SET result_count = result_count + 1
        WHERE id = NEW.job_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate decrement function with hardened search_path and clamping
CREATE OR REPLACE FUNCTION decrement_job_result_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.job_id IS NOT NULL THEN
        UPDATE jobs
        SET result_count = GREATEST(0, result_count - 1)
        WHERE id = OLD.job_id;
    END IF;
    RETURN OLD;
END;
$$;

-- Recreate triggers
CREATE TRIGGER trigger_increment_job_result_count
    AFTER INSERT ON results
    FOR EACH ROW
    EXECUTE FUNCTION increment_job_result_count();

CREATE TRIGGER trigger_decrement_job_result_count
    AFTER DELETE ON results
    FOR EACH ROW
    EXECUTE FUNCTION decrement_job_result_count();

-- Change FK from CASCADE to SET NULL to preserve leads when job is deleted
-- First drop the existing constraint
ALTER TABLE results DROP CONSTRAINT IF EXISTS results_job_id_fkey;

-- Recreate with SET NULL behavior
ALTER TABLE results 
    ADD CONSTRAINT results_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE SET NULL;

-- Comment for documentation
COMMENT ON FUNCTION increment_job_result_count() IS 'Auto-increments jobs.result_count when a result is inserted. Has hardened search_path.';
COMMENT ON FUNCTION decrement_job_result_count() IS 'Auto-decrements jobs.result_count (clamped to 0) when a result is deleted. Has hardened search_path.';
