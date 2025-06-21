
-- Create a function to initialize user standings when they join a league
CREATE OR REPLACE FUNCTION public.initialize_user_standings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create global user standing if it doesn't exist
  INSERT INTO public.user_standings (user_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.user_id, 0, 0, 0, NULL::integer)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create league standing for the new member
  INSERT INTO public.league_standings (league_id, user_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.league_id, NEW.user_id, 0, 0, 0, NULL::integer)
  ON CONFLICT (league_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize standings when a user joins a league
DROP TRIGGER IF EXISTS initialize_standings_on_league_join ON public.league_members;
CREATE TRIGGER initialize_standings_on_league_join
  AFTER INSERT ON public.league_members
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_standings();

-- Initialize standings for existing league members who don't have them yet
-- First, create global standings for users who don't have them
INSERT INTO public.user_standings (user_id, total_points, correct_picks, total_picks, current_rank)
SELECT DISTINCT lm.user_id, 0, 0, 0, NULL::integer
FROM public.league_members lm
LEFT JOIN public.user_standings us ON lm.user_id = us.user_id
WHERE us.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Then, create league standings for members who don't have them
INSERT INTO public.league_standings (league_id, user_id, total_points, correct_picks, total_picks, current_rank)
SELECT lm.league_id, lm.user_id, 0, 0, 0, NULL::integer
FROM public.league_members lm
LEFT JOIN public.league_standings ls ON lm.league_id = ls.league_id AND lm.user_id = ls.user_id
WHERE ls.user_id IS NULL
ON CONFLICT (league_id, user_id) DO NOTHING;

-- Update rankings for global standings to show all users
WITH ranked_users AS (
  SELECT 
    user_id,
    ROW_NUMBER() OVER (ORDER BY total_points DESC, correct_picks DESC, user_id) as new_rank
  FROM user_standings
)
UPDATE user_standings 
SET current_rank = ranked_users.new_rank,
    updated_at = now()
FROM ranked_users
WHERE user_standings.user_id = ranked_users.user_id;

-- Update rankings for all league standings
WITH ranked_league_users AS (
  SELECT 
    league_id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY league_id ORDER BY total_points DESC, correct_picks DESC, user_id) as new_rank
  FROM league_standings
)
UPDATE league_standings 
SET current_rank = ranked_league_users.new_rank,
    updated_at = now()
FROM ranked_league_users
WHERE league_standings.league_id = ranked_league_users.league_id 
AND league_standings.user_id = ranked_league_users.user_id;
