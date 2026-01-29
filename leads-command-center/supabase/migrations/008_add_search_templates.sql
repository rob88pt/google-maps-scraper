-- Migration: Add Search and Filter Templates
-- Multi-user support with RLS

CREATE TABLE IF NOT EXISTS search_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  column_visibility JSONB NOT NULL DEFAULT '{}',
  column_order JSONB NOT NULL DEFAULT '[]',
  column_sizing JSONB NOT NULL DEFAULT '{}',
  sorting JSONB NOT NULL DEFAULT '[]',
  category TEXT,
  search_query TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE search_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search templates"
    ON search_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search templates"
    ON search_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search templates"
    ON search_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search templates"
    ON search_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_search_templates_updated_at
    BEFORE UPDATE ON search_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
