
-- Comprehensive ranking system fix based on ChatGPT analysis
-- This migration implements a robust ranking architecture to prevent NULL ranks

-- Step 1: Drop existing problematic triggers and function
DROP TRIGGER IF EXISTS recalculate_rankings_on_user_standings_change ON user_standings;
DROP TRIGGER IF EXISTS recalculate_rankings_on_league_standings_change ON league_standings;
DROP FUNCTION IF EXISTS recalculate_rankings();

-- Step 2: Create indexes for optimal ranking performance
CREATE INDEX IF NOT EXISTS idx_user_standings_ranking 
ON user_standings (total_points DESC, correct_picks DESC, user_id ASC);

CREATE INDEX IF NOT EXISTS idx_league_standings_ranking 
ON league_standings (league_id, total_points DESC, correct_picks DESC, user_id ASC);

-- Step 3: Create a robust ranking refresh function using set-based operations
CREATE OR REPLACE FUNCTION refresh_all_rankings()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh global rankings using ROW_NUMBER() to ensure sequential numbering
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (
        ORDER BY 
          total_points DESC, 
          correct_picks DESC, 
          user_id ASC
      ) as new_rank
    FROM user_standings
  )
  UPDATE user_standings 
  SET current_rank = ranked_users.new_rank,
      updated_at = now()
  FROM ranked_users
  WHERE user_standings.user_id = ranked_users.user_id;

  -- Refresh league rankings using ROW_NUMBER() with PARTITION BY
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
    FROM league_standings
  )
  UPDATE league_standings 
  SET current_rank = ranked_league_users.new_rank,
      updated_at = now()
  FROM ranked_league_users
  WHERE league_standings.league_id = ranked_league_users.league_id 
  AND league_standings.user_id = ranked_league_users.user_id;

  -- Log the refresh for monitoring
  RAISE NOTICE 'Rankings refreshed at %', now();
END;
$$;

-- Step 4: Create statement-level triggers (not row-level) to prevent performance issues
CREATE OR REPLACE FUNCTION trigger_refresh_rankings()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Only refresh rankings, don't return row data for statement-level trigger
  PERFORM refresh_all_rankings();
  RETURN NULL;
END;
$$;

-- Create AFTER STATEMENT triggers (not FOR EACH ROW)
CREATE TRIGGER refresh_rankings_on_user_standings_change
  AFTER INSERT OR UPDATE OF total_points, correct_picks OR DELETE ON user_standings
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_rankings();

CREATE TRIGGER refresh_rankings_on_league_standings_change
  AFTER INSERT OR UPDATE OF total_points, correct_picks OR DELETE ON league_standings
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_rankings();

-- Step 5: Initial cleanup and ranking calculation
-- First ensure no NULL ranks exist by setting a default
UPDATE user_standings 
SET current_rank = 999, updated_at = now() 
WHERE current_rank IS NULL;

UPDATE league_standings 
SET current_rank = 999, updated_at = now() 
WHERE current_rank IS NULL;

-- Now calculate proper rankings
SELECT refresh_all_rankings();

-- Step 6: Add constraints to prevent NULL ranks in the future
ALTER TABLE user_standings 
ALTER COLUMN current_rank SET NOT NULL,
ALTER COLUMN current_rank SET DEFAULT 999;

ALTER TABLE league_standings 
ALTER COLUMN current_rank SET NOT NULL,
ALTER COLUMN current_rank SET DEFAULT 999;

-- Step 7: Create a maintenance function for admin use
CREATE OR REPLACE FUNCTION admin_refresh_rankings()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
  league_count INTEGER;
BEGIN
  -- Temporarily disable triggers to prevent recursion during bulk operations
  ALTER TABLE user_standings DISABLE TRIGGER refresh_rankings_on_user_standings_change;
  ALTER TABLE league_standings DISABLE TRIGGER refresh_rankings_on_league_standings_change;
  
  -- Perform the refresh
  PERFORM refresh_all_rankings();
  
  -- Re-enable triggers
  ALTER TABLE user_standings ENABLE TRIGGER refresh_rankings_on_user_standings_change;
  ALTER TABLE league_standings ENABLE TRIGGER refresh_rankings_on_league_standings_change;
  
  -- Get counts for reporting
  SELECT COUNT(*) INTO user_count FROM user_standings;
  SELECT COUNT(*) INTO league_count FROM league_standings;
  
  RETURN format('Rankings refreshed successfully. Updated %s users and %s league standings.', 
                user_count, league_count);
END;
$$;

-- Step 8: Create a view for real-time ranking queries (alternative to stored ranks)
CREATE OR REPLACE VIEW v_live_user_rankings AS
SELECT
  us.*,
  ROW_NUMBER() OVER (
    ORDER BY us.total_points DESC, us.correct_picks DESC, us.user_id ASC
  ) AS live_rank
FROM user_standings us;

CREATE OR REPLACE VIEW v_live_league_rankings AS
SELECT
  ls.*,
  ROW_NUMBER() OVER (
    PARTITION BY ls.league_id
    ORDER BY ls.total_points DESC, ls.correct_picks DESC, ls.user_id ASC
  ) AS live_rank
FROM league_standings ls;

-- Step 9: Create monitoring function to detect ranking issues
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
    'Duplicate rank values found'::TEXT
  FROM (
    SELECT current_rank 
    FROM user_standings 
    GROUP BY current_rank 
    HAVING COUNT(*) > 1
  ) duplicates;

  -- Check for gaps in ranking sequence
  RETURN QUERY
  SELECT 
    'ranking_gaps'::TEXT,
    'user_standings'::TEXT,
    (MAX(current_rank) - COUNT(*))::BIGINT,
    'Gap between max rank and user count'::TEXT
  FROM user_standings;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION refresh_all_rankings() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_refresh_rankings() TO authenticated;
GRANT EXECUTE ON FUNCTION check_ranking_integrity() TO authenticated;
GRANT SELECT ON v_live_user_rankings TO authenticated;
GRANT SELECT ON v_live_league_rankings TO authenticated;
