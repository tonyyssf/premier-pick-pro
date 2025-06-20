
-- Create a function to check if all fixtures in a gameweek are finished
CREATE OR REPLACE FUNCTION public.check_gameweek_completion(gameweek_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM fixtures 
    WHERE gameweek_id = gameweek_uuid 
    AND status IN ('scheduled', 'live')
  );
$$;

-- Create a function to advance to the next gameweek
CREATE OR REPLACE FUNCTION public.advance_to_next_gameweek()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_gw RECORD;
  next_gw RECORD;
  all_fixtures_finished BOOLEAN;
BEGIN
  -- Get the current gameweek
  SELECT * INTO current_gw FROM gameweeks WHERE is_current = true;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No current gameweek found';
    RETURN;
  END IF;
  
  -- Check if all fixtures in current gameweek are finished
  SELECT check_gameweek_completion(current_gw.id) INTO all_fixtures_finished;
  
  IF NOT all_fixtures_finished THEN
    RAISE NOTICE 'Not all fixtures are finished for gameweek %', current_gw.number;
    RETURN;
  END IF;
  
  -- Get the next gameweek
  SELECT * INTO next_gw FROM gameweeks 
  WHERE number = current_gw.number + 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No next gameweek found after gameweek %', current_gw.number;
    RETURN;
  END IF;
  
  -- Update current gameweek to not current
  UPDATE gameweeks 
  SET is_current = false, updated_at = now()
  WHERE id = current_gw.id;
  
  -- Set next gameweek as current
  UPDATE gameweeks 
  SET is_current = true, updated_at = now()
  WHERE id = next_gw.id;
  
  RAISE NOTICE 'Advanced from gameweek % to gameweek %', current_gw.number, next_gw.number;
END;
$$;

-- Insert gameweek 2 so we have a next gameweek to advance to
INSERT INTO public.gameweeks (number, start_date, end_date, deadline, is_current) VALUES
(2, '2025-08-22 00:00:00+00', '2025-08-24 23:59:59+00', '2025-08-22 12:30:00+00', false)
ON CONFLICT (number) DO NOTHING;

-- Insert sample fixtures for Gameweek 2
WITH gameweek_2 AS (
  SELECT id FROM public.gameweeks WHERE number = 2
),
team_ids AS (
  SELECT name, id FROM public.teams
)
INSERT INTO public.fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time) 
SELECT 
  gw.id as gameweek_id,
  ht.id as home_team_id,
  at.id as away_team_id,
  '2025-08-22 15:00:00+00'::timestamp with time zone as kickoff_time
FROM gameweek_2 gw
CROSS JOIN (
  VALUES 
    ('Chelsea', 'Arsenal'),
    ('Liverpool', 'Manchester City'),
    ('Tottenham Hotspur', 'Manchester United'),
    ('Brighton & Hove Albion', 'Newcastle United'),
    ('Brentford', 'Aston Villa'),
    ('Everton', 'Crystal Palace'),
    ('West Ham United', 'Fulham'),
    ('Wolverhampton Wanderers', 'Nottingham Forest'),
    ('Burnley', 'Sheffield United'),
    ('Luton Town', 'Bournemouth')
) AS matches(home_team, away_team)
JOIN team_ids ht ON ht.name = matches.home_team
JOIN team_ids at ON at.name = matches.away_team
WHERE NOT EXISTS (
  SELECT 1 FROM fixtures f2 
  WHERE f2.gameweek_id = gw.id 
  AND f2.home_team_id = ht.id 
  AND f2.away_team_id = at.id
);
