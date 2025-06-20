
-- Create a table to track league-specific standings
CREATE TABLE public.league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_picks INTEGER NOT NULL DEFAULT 0,
  total_picks INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Enable RLS on league_standings
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;

-- RLS policies for league_standings
CREATE POLICY "Users can view league standings for accessible leagues" 
  ON public.league_standings 
  FOR SELECT 
  USING (
    public.is_league_creator(auth.uid(), league_id) OR 
    public.is_league_public(league_id) OR
    public.is_league_member(auth.uid(), league_id)
  );

CREATE POLICY "System can insert league standings" 
  ON public.league_standings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update league standings" 
  ON public.league_standings 
  FOR UPDATE 
  USING (true);

-- Update the calculate_gameweek_scores function to also calculate league standings
CREATE OR REPLACE FUNCTION public.calculate_gameweek_scores(gameweek_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pick_record RECORD;
  league_record RECORD;
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
  
  -- Update global user standings
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
    
  -- Update global rankings
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

  -- Update league-specific standings for all leagues
  FOR league_record IN SELECT id FROM leagues LOOP
    -- Calculate league standings
    INSERT INTO league_standings (league_id, user_id, total_points, correct_picks, total_picks)
    SELECT 
      league_record.id,
      gs.user_id,
      COALESCE(SUM(gs.points), 0) as total_points,
      COALESCE(SUM(CASE WHEN gs.is_correct THEN 1 ELSE 0 END), 0) as correct_picks,
      COUNT(gs.id) as total_picks
    FROM gameweek_scores gs
    INNER JOIN league_members lm ON lm.user_id = gs.user_id AND lm.league_id = league_record.id
    WHERE gs.user_id IN (
      SELECT DISTINCT user_id FROM gameweek_scores WHERE gameweek_id = gameweek_uuid
    )
    GROUP BY gs.user_id
    ON CONFLICT (league_id, user_id)
    DO UPDATE SET
      total_points = EXCLUDED.total_points,
      correct_picks = EXCLUDED.correct_picks,
      total_picks = EXCLUDED.total_picks,
      updated_at = now();
      
    -- Update league rankings
    WITH ranked_league_users AS (
      SELECT 
        user_id,
        ROW_NUMBER() OVER (ORDER BY total_points DESC, correct_picks DESC) as new_rank
      FROM league_standings
      WHERE league_id = league_record.id
    )
    UPDATE league_standings 
    SET current_rank = ranked_league_users.new_rank,
        updated_at = now()
    FROM ranked_league_users
    WHERE league_standings.league_id = league_record.id 
    AND league_standings.user_id = ranked_league_users.user_id;
  END LOOP;
END;
$$;
