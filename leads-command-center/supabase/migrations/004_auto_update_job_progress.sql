-- ============================================
-- Migration: Auto-update Job Progress
-- Updates jobs.result_count when results are inserted
-- ============================================

-- Function to increment result_count
CREATE OR REPLACE FUNCTION increment_job_result_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.job_id IS NOT NULL THEN
        UPDATE jobs
        SET result_count = result_count + 1
        WHERE id = NEW.job_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on results table
DROP TRIGGER IF EXISTS trigger_increment_job_result_count ON results;
CREATE TRIGGER trigger_increment_job_result_count
    AFTER INSERT ON results
    FOR EACH ROW
    EXECUTE FUNCTION increment_job_result_count();

-- Optional: Function to handle deletions if needed (for accuracy)
CREATE OR REPLACE FUNCTION decrement_job_result_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.job_id IS NOT NULL THEN
        UPDATE jobs
        SET result_count = result_count - 1
        WHERE id = OLD.job_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_decrement_job_result_count ON results;
CREATE TRIGGER trigger_decrement_job_result_count
    AFTER DELETE ON results
    FOR EACH ROW
    EXECUTE FUNCTION decrement_job_result_count();
