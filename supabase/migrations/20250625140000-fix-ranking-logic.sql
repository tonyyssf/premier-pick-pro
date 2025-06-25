
-- Fix ranking logic to ensure sequential numbering
-- First, let's clean up any inconsistent data and recalculate all rankings

-- Update rankings for global standings to show all users with proper sequential ranking
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

-- Update rankings for all league standings with proper sequential ranking
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

-- Create a function to maintain proper rankings when standings are updated
CREATE OR REPLACE FUNCTION recalculate_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate global rankings
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

  -- Recalculate league rankings for the affected league (if applicable)
  IF TG_TABLE_NAME = 'league_standings' THEN
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
      WHERE league_id = COALESCE(NEW.league_id, OLD.league_id)
    )
    UPDATE league_standings 
    SET current_rank = ranked_league_users.new_rank,
        updated_at = now()
    FROM ranked_league_users
    WHERE league_standings.league_id = ranked_league_users.league_id 
    AND league_standings.user_id = ranked_league_users.user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically recalculate rankings when standings change
DROP TRIGGER IF EXISTS recalculate_rankings_on_user_standings_change ON user_standings;
CREATE TRIGGER recalculate_rankings_on_user_standings_change
  AFTER INSERT OR UPDATE OR DELETE ON user_standings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_rankings();

DROP TRIGGER IF EXISTS recalculate_rankings_on_league_standings_change ON league_standings;
CREATE TRIGGER recalculate_rankings_on_league_standings_change
  AFTER INSERT OR UPDATE OR DELETE ON league_standings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_rankings();
