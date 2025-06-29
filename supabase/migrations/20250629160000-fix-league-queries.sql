
-- Drop the problematic function that references is_public column
DROP FUNCTION IF EXISTS public.is_league_public(_league_id uuid);

-- Create a new version that doesn't rely on is_public column
-- Since we removed is_public, we'll assume all leagues are viewable by members
CREATE OR REPLACE FUNCTION public.is_league_public(_league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
  -- Since we removed is_public column, return true for existing leagues
  -- This maintains compatibility while we transition away from this function
  SELECT EXISTS (SELECT 1 FROM public.leagues WHERE id = _league_id);
$$;
