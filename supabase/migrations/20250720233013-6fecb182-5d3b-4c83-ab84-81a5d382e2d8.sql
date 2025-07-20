
-- First, let's drop the current fixtures table and recreate it with the correct schema
DROP TABLE IF EXISTS fixtures CASCADE;

-- Recreate the fixtures table with the correct schema
CREATE TABLE public.fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gameweek_id UUID NOT NULL,
  home_team_id UUID NOT NULL,
  away_team_id UUID NOT NULL,
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_gameweek_id_fkey 
FOREIGN KEY (gameweek_id) REFERENCES public.gameweeks(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_home_team_id_fkey 
FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_away_team_id_fkey 
FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view fixtures" 
ON public.fixtures 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage fixtures" 
ON public.fixtures 
FOR ALL 
TO authenticated 
USING (is_admin());

-- Add indexes for better performance
CREATE INDEX idx_fixtures_gameweek_id ON public.fixtures(gameweek_id);
CREATE INDEX idx_fixtures_home_team_id ON public.fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team_id ON public.fixtures(away_team_id);
CREATE INDEX idx_fixtures_kickoff_time ON public.fixtures(kickoff_time);

-- Now insert the correct Matchweek 1 fixtures for 2025/26 season
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
-- Saturday, August 16, 2025
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Arsenal'), 
 (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers'), 
 '2025-08-16 12:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion'), 
 (SELECT id FROM teams WHERE name = 'Everton'), 
 '2025-08-16 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Chelsea'), 
 (SELECT id FROM teams WHERE name = 'Manchester City'), 
 '2025-08-16 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Crystal Palace'), 
 (SELECT id FROM teams WHERE name = 'West Ham United'), 
 '2025-08-16 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Fulham'), 
 (SELECT id FROM teams WHERE name = 'Manchester United'), 
 '2025-08-16 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Leeds United'), 
 (SELECT id FROM teams WHERE name = 'Liverpool'), 
 '2025-08-16 17:30:00+00', 'scheduled'),
-- Sunday, August 17, 2025
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Aston Villa'), 
 (SELECT id FROM teams WHERE name = 'Newcastle United'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Burnley'), 
 (SELECT id FROM teams WHERE name = 'Nottingham Forest'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Sunderland'), 
 (SELECT id FROM teams WHERE name = 'AFC Bournemouth'), 
 '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Tottenham Hotspur'), 
 (SELECT id FROM teams WHERE name = 'Brentford'), 
 '2025-08-17 16:30:00+00', 'scheduled');

-- Ensure gameweek 1 exists and is set as current
INSERT INTO gameweeks (id, number, start_date, end_date, deadline, is_current) VALUES 
(gen_random_uuid(), 1, '2025-08-16 00:00:00+00', '2025-08-17 23:59:59+00', '2025-08-16 11:30:00+00', true)
ON CONFLICT (number) DO UPDATE SET 
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  deadline = EXCLUDED.deadline,
  is_current = EXCLUDED.is_current,
  updated_at = now();
