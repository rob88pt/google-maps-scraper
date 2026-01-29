-- Add 'archived' to lead_status check constraint
ALTER TABLE public.lead_status DROP CONSTRAINT IF EXISTS lead_status_status_check;
ALTER TABLE public.lead_status ADD CONSTRAINT lead_status_status_check 
CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'closed'::text, 'archived'::text]));

-- Fix lead_status Primary Key for multi-user support
ALTER TABLE public.lead_status DROP CONSTRAINT IF EXISTS lead_status_pkey;
ALTER TABLE public.lead_status ADD PRIMARY KEY (user_id, lead_cid);

-- Add composite Foreign Key for lead_status referencing results
ALTER TABLE public.lead_status DROP CONSTRAINT IF EXISTS fk_lead_status_results;
ALTER TABLE public.lead_status
ADD CONSTRAINT fk_lead_status_results 
FOREIGN KEY (user_id, lead_cid) 
REFERENCES public.results(user_id, cid) 
ON DELETE CASCADE;

-- Add composite Foreign Key for lead_notes referencing results
ALTER TABLE public.lead_notes DROP CONSTRAINT IF EXISTS fk_lead_notes_results;
ALTER TABLE public.lead_notes
ADD CONSTRAINT fk_lead_notes_results 
FOREIGN KEY (user_id, lead_cid) 
REFERENCES public.results(user_id, cid) 
ON DELETE CASCADE;

-- Enable RLS and setup policies
ALTER TABLE public.lead_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own lead status" ON public.lead_status;
CREATE POLICY "Users can view their own lead status" ON public.lead_status FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own lead status" ON public.lead_status;
CREATE POLICY "Users can manage their own lead status" ON public.lead_status FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can view their own lead notes" ON public.lead_notes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can manage their own lead notes" ON public.lead_notes FOR ALL USING (auth.uid() = user_id);
