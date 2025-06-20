
-- Create a table to track scores for each gameweek
CREATE TABLE public.gameweek_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gameweek_id UUID REFERENCES public.gameweeks(id) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, gameweek_id)
);

-- Create a table to track overall user standings
CREATE TABLE public.user_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_picks INTEGER NOT NULL DEFAULT 0,
  total_picks INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.gameweek_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_standings ENABLE ROW LEVEL SECURITY;

-- RLS policies for gameweek_scores
CREATE POLICY "Users can view all gameweek scores" 
  ON public.gameweek_scores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own gameweek scores" 
  ON public.gameweek_scores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gameweek scores" 
  ON public.gameweek_scores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for user_standings  
CREATE POLICY "Users can view all standings" 
  ON public.user_standings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own standings" 
  ON public.user_standings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own standings" 
  ON public.user_standings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a function to calculate and update scores when fixtures are completed
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

-- Create a function to manually trigger score calculation (useful for testing)
CREATE OR REPLACE FUNCTION public.update_all_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  gw_record RECORD;
BEGIN
  FOR gw_record IN SELECT id FROM gameweeks LOOP
    PERFORM calculate_gameweek_scores(gw_record.id);
  END LOOP;
END;
$$;
