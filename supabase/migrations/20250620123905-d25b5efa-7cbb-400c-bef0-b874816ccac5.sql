
-- Update the calculate_gameweek_scores function to award 1 point for ties
CREATE OR REPLACE FUNCTION public.calculate_gameweek_scores(gameweek_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pick_record RECORD;
  fixture_record RECORD;
  points_awarded INTEGER;
  is_pick_correct BOOLEAN;
BEGIN
  -- Loop through all picks for the given gameweek
  FOR pick_record IN 
    SELECT up.*, f.home_score, f.away_score, f.home_team_id, f.away_team_id, f.status
    FROM user_picks up
    JOIN fixtures f ON up.fixture_id = f.id
    WHERE up.gameweek_id = gameweek_uuid
    AND f.status = 'finished'
  LOOP
    points_awarded := 0;
    is_pick_correct := false;
    
    -- Check if the pick was correct (picked team won)
    IF (pick_record.picked_team_id = pick_record.home_team_id AND pick_record.home_score > pick_record.away_score) OR
       (pick_record.picked_team_id = pick_record.away_team_id AND pick_record.away_score > pick_record.home_score) THEN
      points_awarded := 3;
      is_pick_correct := true;
    -- Check if it's a tie (award 1 point)
    ELSIF pick_record.home_score = pick_record.away_score THEN
      points_awarded := 1;
      is_pick_correct := false; -- ties are not considered "correct" picks for win rate calculation
    END IF;
    
    -- Insert or update the gameweek score
    INSERT INTO gameweek_scores (user_id, gameweek_id, points, is_correct)
    VALUES (pick_record.user_id, gameweek_uuid, points_awarded, is_pick_correct)
    ON CONFLICT (user_id, gameweek_id)
    DO UPDATE SET 
      points = EXCLUDED.points,
      is_correct = EXCLUDED.is_correct,
      updated_at = now();
  END LOOP;
  
  -- Update user standings
  INSERT INTO user_standings (user_id, total_points, correct_picks, total_picks)
  SELECT 
    gs.user_id,
    COALESCE(SUM(gs.points), 0) as total_points,
    COALESCE(SUM(CASE WHEN gs.is_correct THEN 1 ELSE 0 END), 0) as correct_picks,
    COUNT(gs.id) as total_picks
  FROM gameweek_scores gs
  WHERE gs.user_id IN (
    SELECT DISTINCT user_id FROM gameweek_scores WHERE gameweek_id = gameweek_uuid
  )
  GROUP BY gs.user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = EXCLUDED.total_points,
    correct_picks = EXCLUDED.correct_picks,
    total_picks = EXCLUDED.total_picks,
    updated_at = now();
    
  -- Update rankings
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, correct_picks DESC) as new_rank
    FROM user_standings
  )
  UPDATE user_standings 
  SET current_rank = ranked_users.new_rank,
      updated_at = now()
  FROM ranked_users
  WHERE user_standings.user_id = ranked_users.user_id;
END;
$$;
