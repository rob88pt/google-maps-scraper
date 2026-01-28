-- Add accent-insensitive search optimization
-- 1. Create a truly immutable unaccent wrapper
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- 2. Create an immutable search text generator function
CREATE OR REPLACE FUNCTION public.generate_search_index(data jsonb)
RETURNS text AS $$
BEGIN
  RETURN public.f_unaccent(LOWER(
    COALESCE(data->>'title', '') || ' ' || 
    COALESCE(data->>'category', '') || ' ' || 
    COALESCE(data->>'address', '') || ' ' || 
    COALESCE(data->>'input_id', '') || ' ' || 
    COALESCE(data->'complete_address'->>'city', '')
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- 3. Add the generated column
ALTER TABLE results
ADD COLUMN IF NOT EXISTS search_index text
GENERATED ALWAYS AS (public.generate_search_index(data)) STORED;

-- 4. Create the index
CREATE INDEX IF NOT EXISTS idx_results_search_index ON public.results (search_index);
