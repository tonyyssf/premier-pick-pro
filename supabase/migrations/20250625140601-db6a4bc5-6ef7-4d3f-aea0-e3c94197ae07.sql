
-- First, drop the dependent policy that references league_standings
DROP POLICY IF EXISTS "Users can view gameweek scores for leagues they belong to" ON gameweek_scores;

-- Now let's create the unified standings table
CREATE TABLE public.standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  league_id UUID NULL, -- NULL means global standings, non-NULL means league-specific
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_picks INTEGER NOT NULL DEFAULT 0,
  total_picks INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure each user has only one record per league (or global)
  UNIQUE(user_id, league_id)
);

-- Create indexes for optimal performance
CREATE INDEX idx_standings_global ON standings (league_id) WHERE league_id IS NULL;
CREATE INDEX idx_standings_league ON standings (league_id) WHERE league_id IS NOT NULL;
CREATE INDEX idx_standings_ranking ON standings (league_id, total_points DESC, correct_picks DESC, user_id ASC);

-- Migrate existing data from user_standings (global standings) if the table exists
INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank, created_at, updated_at)
SELECT user_id, NULL as league_id, total_points, correct_picks, total_picks, COALESCE(current_rank, 999), created_at, updated_at
FROM user_standings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_standings');

-- Migrate existing data from league_standings if the table exists
INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank, created_at, updated_at)
SELECT user_id, league_id, total_points, correct_picks, total_picks, COALESCE(current_rank, 999), created_at, updated_at
FROM league_standings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'league_standings');

-- Drop the old tables
DROP TABLE IF EXISTS user_standings CASCADE;
DROP TABLE IF EXISTS league_standings CASCADE;

-- Update the refresh_all_rankings function to work with the unified table
CREATE OR REPLACE FUNCTION refresh_all_rankings()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh global rankings (where league_id IS NULL)
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

  -- Refresh league-specific rankings (where league_id IS NOT NULL)
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

  RAISE NOTICE 'Rankings refreshed at %', now();
END;
$$;

-- Update the admin_refresh_rankings function
CREATE OR REPLACE FUNCTION admin_refresh_rankings()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the integrity check function
CREATE OR REPLACE FUNCTION check_ranking_integrity()
RETURNS TABLE(
  issue_type TEXT,
  table_name TEXT,
  issue_count BIGINT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create a function to initialize missing standings for a specific user
CREATE OR REPLACE FUNCTION initialize_user_complete_standings(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the trigger to work with the new unified table
CREATE OR REPLACE FUNCTION initialize_user_standings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant permissions
GRANT ALL ON standings TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_rankings() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_refresh_rankings() TO authenticated;
GRANT EXECUTE ON FUNCTION check_ranking_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user_complete_standings(UUID) TO authenticated;
