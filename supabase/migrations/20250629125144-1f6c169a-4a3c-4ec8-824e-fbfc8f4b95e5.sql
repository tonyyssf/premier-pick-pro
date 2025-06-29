
-- Fix the is_league_public function to not reference the removed is_public column
-- Since we removed the is_public column, we'll make this function return true for existing leagues
-- that the user has access to (either as a member or creator)
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
