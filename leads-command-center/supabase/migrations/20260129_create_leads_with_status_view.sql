-- Migration: create_leads_with_status_view
-- Created: 2026-01-29

-- Create a view that joins results with lead_status for easier filtering
-- This view allows proper filtering by status at the row level (PostgREST limitation workaround)

CREATE OR REPLACE VIEW leads_with_status AS
SELECT 
    r.id,
    r.cid,
    r.data,
    r.created_at,
    r.user_id as result_user_id,
    r.search_index,
    ls.user_id as status_user_id,
    COALESCE(ls.status, 'new') as crm_status
FROM results r
LEFT JOIN lead_status ls ON r.cid = ls.lead_cid;

-- Grant access
GRANT SELECT ON leads_with_status TO authenticated, anon;
