
-- Fix missing user standings and league standings entries
-- This migration ensures all users have proper standings entries

-- First, let's identify and fix users without global standings
INSERT INTO user_standings (user_id, total_points, correct_picks, total_picks, current_rank)
SELECT 
  p.id,
  0 as total_points,
  0 as correct_picks,
  0 as total_picks,
  NULL as current_rank
FROM profiles p
LEFT JOIN user_standings us ON p.id = us.user_id
WHERE us.user_id IS NULL;

-- Next, let's ensure all league members have league standings entries
INSERT INTO league_standings (league_id, user_id, total_points, correct_picks, total_picks, current_rank)
SELECT 
  lm.league_id,
  lm.user_id,
  0 as total_points,
  0 as correct_picks,
  0 as total_picks,
  NULL as current_rank
FROM league_members lm
LEFT JOIN league_standings ls ON lm.league_id = ls.league_id AND lm.user_id = ls.user_id
WHERE ls.user_id IS NULL;

-- Now refresh all rankings to ensure proper sequential ranking
SELECT refresh_all_rankings();

-- Update the monitoring function to provide more detailed information
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
    'missing_standings'::TEXT,
    'user_standings'::TEXT,
    COUNT(*)::BIGINT,
    'Users without global standings entries'::TEXT
  FROM profiles p
  LEFT JOIN user_standings us ON p.id = us.user_id
  WHERE us.user_id IS NULL;

  -- Check for league members without league standings
  RETURN QUERY
  SELECT 
    'missing_league_standings'::TEXT,
    'league_standings'::TEXT,
    COUNT(*)::BIGINT,
    'League members without standings entries'::TEXT
  FROM league_members lm
  LEFT JOIN league_standings ls ON lm.league_id = ls.league_id AND lm.user_id = ls.user_id
  WHERE ls.user_id IS NULL;

  -- Check for NULL ranks in user_standings
  RETURN QUERY
  SELECT 
    'null_ranks'::TEXT,
    'user_standings'::TEXT,
    COUNT(*)::BIGINT,
    'Users with NULL current_rank'::TEXT
  FROM user_standings 
  WHERE current_rank IS NULL;

  -- Check for NULL ranks in league_standings
  RETURN QUERY
  SELECT 
    'null_ranks'::TEXT,
    'league_standings'::TEXT,
    COUNT(*)::BIGINT,
    'League standings with NULL current_rank'::TEXT
  FROM league_standings 
  WHERE current_rank IS NULL;

  -- Check for duplicate ranks in user_standings
  RETURN QUERY
  SELECT 
    'duplicate_ranks'::TEXT,
    'user_standings'::TEXT,
    COUNT(*)::BIGINT,
    'Duplicate rank values found in global standings'::TEXT
  FROM (
    SELECT current_rank 
    FROM user_standings 
    WHERE current_rank IS NOT NULL
    GROUP BY current_rank 
    HAVING COUNT(*) > 1
  ) duplicates;

  -- Check for duplicate ranks within each league
  RETURN QUERY
  SELECT 
    'duplicate_league_ranks'::TEXT,
    'league_standings'::TEXT,
    COUNT(DISTINCT league_id)::BIGINT,
    'Leagues with duplicate rank values'::TEXT
  FROM (
    SELECT league_id, current_rank 
    FROM league_standings 
    WHERE current_rank IS NOT NULL
    GROUP BY league_id, current_rank 
    HAVING COUNT(*) > 1
  ) league_duplicates;

  -- Check for ranking gaps in global standings
  RETURN QUERY
  SELECT 
    'ranking_gaps'::TEXT,
    'user_standings'::TEXT,
    CASE 
      WHEN MAX(current_rank) IS NULL THEN 0
      ELSE (MAX(current_rank) - COUNT(*))::BIGINT
    END,
    'Gap between max rank and user count in global standings'::TEXT
  FROM user_standings
  WHERE current_rank IS NOT NULL;
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
  -- Create global user standing if it doesn't exist
  INSERT INTO user_standings (user_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (target_user_id, 0, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create league standings for all leagues the user is a member of
  INSERT INTO league_standings (league_id, user_id, total_points, correct_picks, total_picks, current_rank)
  SELECT lm.league_id, target_user_id, 0, 0, 0, NULL
  FROM league_members lm
  WHERE lm.user_id = target_user_id
  ON CONFLICT (league_id, user_id) DO NOTHING;
  
  -- Get count of leagues
  SELECT COUNT(*) INTO leagues_joined
  FROM league_members
  WHERE user_id = target_user_id;
  
  -- Refresh rankings
  PERFORM refresh_all_rankings();
  
  RETURN format('Initialized standings for user %s in %s leagues', target_user_id, leagues_joined);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION initialize_user_complete_standings(UUID) TO authenticated;
