
-- Fix function search path security warnings by setting proper search_path for all functions

-- Update check_ranking_integrity function
CREATE OR REPLACE FUNCTION public.check_ranking_integrity()
RETURNS TABLE(issue_type text, table_name text, issue_count bigint, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  -- Check for users without global standings
  RETURN QUERY
  SELECT 
    'missing_global_standings'::TEXT,
    'standings'::TEXT,
    COUNT(*)::BIGINT,
    'Users without global standings entries'::TEXT
  FROM profiles p
  LEFT JOIN standings s ON p.id = s.user_id AND s.league_id IS NULL
  WHERE s.user_id IS NULL;

  -- Check for league members without league standings
  RETURN QUERY
  SELECT 
    'missing_league_standings'::TEXT,
    'standings'::TEXT,
    COUNT(*)::BIGINT,
    'League members without standings entries'::TEXT
  FROM league_members lm
  LEFT JOIN standings s ON lm.user_id = s.user_id AND lm.league_id = s.league_id
  WHERE s.user_id IS NULL;

  -- Check for NULL ranks in global standings
  RETURN QUERY
  SELECT 
    'null_global_ranks'::TEXT,
    'standings'::TEXT,
    COUNT(*)::BIGINT,
    'Global standings with NULL current_rank'::TEXT
  FROM standings 
  WHERE league_id IS NULL AND current_rank IS NULL;

  -- Check for NULL ranks in league standings
  RETURN QUERY
  SELECT 
    'null_league_ranks'::TEXT,
    'standings'::TEXT,
    COUNT(*)::BIGINT,
    'League standings with NULL current_rank'::TEXT
  FROM standings 
  WHERE league_id IS NOT NULL AND current_rank IS NULL;

  -- Check for duplicate ranks in global standings
  RETURN QUERY
  SELECT 
    'duplicate_global_ranks'::TEXT,
    'standings'::TEXT,
    COUNT(*)::BIGINT,
    'Duplicate rank values in global standings'::TEXT
  FROM (
    SELECT current_rank 
    FROM standings 
    WHERE league_id IS NULL AND current_rank IS NOT NULL
    GROUP BY current_rank 
    HAVING COUNT(*) > 1
  ) duplicates;

  -- Check for duplicate ranks within leagues
  RETURN QUERY
  SELECT 
    'duplicate_league_ranks'::TEXT,
    'standings'::TEXT,
    COUNT(DISTINCT league_id)::BIGINT,
    'Leagues with duplicate rank values'::TEXT
  FROM (
    SELECT league_id, current_rank 
    FROM standings 
    WHERE league_id IS NOT NULL AND current_rank IS NOT NULL
    GROUP BY league_id, current_rank 
    HAVING COUNT(*) > 1
  ) league_duplicates;
END;
$$;

-- Update initialize_user_complete_standings function
CREATE OR REPLACE FUNCTION public.initialize_user_complete_standings(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  leagues_joined INTEGER := 0;
BEGIN
  -- Create global standing if it doesn't exist
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (target_user_id, NULL, 0, 0, 0, 999)
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  -- Create league standings for all leagues the user is a member of
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  SELECT lm.league_id, target_user_id, 0, 0, 0, 999
  FROM league_members lm
  WHERE lm.user_id = target_user_id
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  -- Get count of leagues
  SELECT COUNT(*) INTO leagues_joined
  FROM league_members
  WHERE user_id = target_user_id;
  
  -- Refresh rankings
  PERFORM refresh_all_rankings();
  
  RETURN format('Initialized standings for user %s in %s leagues plus global standings', target_user_id, leagues_joined);
END;
$$;

-- Update refresh_all_rankings function
CREATE OR REPLACE FUNCTION public.refresh_all_rankings()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  -- Refresh global rankings using ROW_NUMBER() to ensure sequential numbering starting from 1
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (
        ORDER BY 
          total_points DESC, 
          correct_picks DESC, 
          user_id ASC
      ) as new_rank
    FROM standings
    WHERE league_id IS NULL
  )
  UPDATE standings 
  SET current_rank = ranked_users.new_rank,
      updated_at = now()
  FROM ranked_users
  WHERE standings.user_id = ranked_users.user_id
  AND standings.league_id IS NULL;

  -- Refresh league-specific rankings using ROW_NUMBER() with PARTITION BY
  WITH ranked_league_users AS (
    SELECT 
      league_id,
      user_id,
      ROW_NUMBER() OVER (
        PARTITION BY league_id 
        ORDER BY 
          total_points DESC, 
          correct_picks DESC, 
          user_id ASC
      ) as new_rank
    FROM standings
    WHERE league_id IS NOT NULL
  )
  UPDATE standings 
  SET current_rank = ranked_league_users.new_rank,
      updated_at = now()
  FROM ranked_league_users
  WHERE standings.league_id = ranked_league_users.league_id 
  AND standings.user_id = ranked_league_users.user_id;

  -- Log the refresh for monitoring
  RAISE NOTICE 'Rankings refreshed at %', now();
END;
$$;

-- Update admin_refresh_rankings function
CREATE OR REPLACE FUNCTION public.admin_refresh_rankings()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  total_count INTEGER;
BEGIN
  -- Perform the refresh
  PERFORM refresh_all_rankings();
  
  -- Get counts for reporting
  SELECT COUNT(*) INTO total_count FROM standings;
  
  RETURN format('Rankings refreshed successfully. Updated %s total standings records.', total_count);
END;
$$;

-- Update initialize_user_standings function
CREATE OR REPLACE FUNCTION public.initialize_user_standings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  -- Create global user standing if it doesn't exist
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.user_id, NULL, 0, 0, 0, 999)
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  -- Create league standing for the new member
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.user_id, NEW.league_id, 0, 0, 0, 999)
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update generate_invite_code function
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    code := '';
    
    -- Generate a 6-character code using random() and string manipulation
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars))::integer + 1, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM leagues WHERE invite_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;
