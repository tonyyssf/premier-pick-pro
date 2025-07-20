
-- Drop the current fixtures table completely and recreate with proper schema
DROP TABLE IF EXISTS fixtures CASCADE;

-- Create the fixtures table with the correct schema that matches the application code
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

-- Create all 38 gameweeks for the 2025/26 season
-- First, clear existing gameweeks to avoid conflicts
DELETE FROM gameweeks;

-- Insert all 38 gameweeks with proper dates
INSERT INTO gameweeks (number, start_date, end_date, deadline, is_current) VALUES 
(1, '2025-08-16 00:00:00+00', '2025-08-17 23:59:59+00', '2025-08-16 11:30:00+00', true),
(2, '2025-08-23 00:00:00+00', '2025-08-24 23:59:59+00', '2025-08-23 11:30:00+00', false),
(3, '2025-08-30 00:00:00+00', '2025-08-31 23:59:59+00', '2025-08-30 11:30:00+00', false),
(4, '2025-09-13 00:00:00+00', '2025-09-15 23:59:59+00', '2025-09-13 11:30:00+00', false),
(5, '2025-09-20 00:00:00+00', '2025-09-22 23:59:59+00', '2025-09-20 11:30:00+00', false),
(6, '2025-09-27 00:00:00+00', '2025-09-29 23:59:59+00', '2025-09-27 11:30:00+00', false),
(7, '2025-10-04 00:00:00+00', '2025-10-06 23:59:59+00', '2025-10-04 11:30:00+00', false),
(8, '2025-10-18 00:00:00+00', '2025-10-20 23:59:59+00', '2025-10-18 11:30:00+00', false),
(9, '2025-10-25 00:00:00+00', '2025-10-27 23:59:59+00', '2025-10-25 11:30:00+00', false),
(10, '2025-11-01 00:00:00+00', '2025-11-03 23:59:59+00', '2025-11-01 11:30:00+00', false),
(11, '2025-11-08 00:00:00+00', '2025-11-10 23:59:59+00', '2025-11-08 11:30:00+00', false),
(12, '2025-11-22 00:00:00+00', '2025-11-24 23:59:59+00', '2025-11-22 11:30:00+00', false),
(13, '2025-11-29 00:00:00+00', '2025-12-01 23:59:59+00', '2025-11-29 11:30:00+00', false),
(14, '2025-12-06 00:00:00+00', '2025-12-08 23:59:59+00', '2025-12-06 11:30:00+00', false),
(15, '2025-12-13 00:00:00+00', '2025-12-16 23:59:59+00', '2025-12-13 11:30:00+00', false),
(16, '2025-12-20 00:00:00+00', '2025-12-23 23:59:59+00', '2025-12-20 11:30:00+00', false),
(17, '2025-12-26 00:00:00+00', '2025-12-30 23:59:59+00', '2025-12-26 11:30:00+00', false),
(18, '2026-01-01 00:00:00+00', '2026-01-03 23:59:59+00', '2026-01-01 11:30:00+00', false),
(19, '2026-01-11 00:00:00+00', '2026-01-13 23:59:59+00', '2026-01-11 11:30:00+00', false),
(20, '2026-01-18 00:00:00+00', '2026-01-20 23:59:59+00', '2026-01-18 11:30:00+00', false),
(21, '2026-02-01 00:00:00+00', '2026-02-03 23:59:59+00', '2026-02-01 11:30:00+00', false),
(22, '2026-02-08 00:00:00+00', '2026-02-10 23:59:59+00', '2026-02-08 11:30:00+00', false),
(23, '2026-02-22 00:00:00+00', '2026-02-24 23:59:59+00', '2026-02-22 11:30:00+00', false),
(24, '2026-03-01 00:00:00+00', '2026-03-03 23:59:59+00', '2026-03-01 11:30:00+00', false),
(25, '2026-03-08 00:00:00+00', '2026-03-10 23:59:59+00', '2026-03-08 11:30:00+00', false),
(26, '2026-03-15 00:00:00+00', '2026-03-17 23:59:59+00', '2026-03-15 11:30:00+00', false),
(27, '2026-04-05 00:00:00+00', '2026-04-07 23:59:59+00', '2026-04-05 11:30:00+00', false),
(28, '2026-04-12 00:00:00+00', '2026-04-14 23:59:59+00', '2026-04-12 11:30:00+00', false),
(29, '2026-04-19 00:00:00+00', '2026-04-21 23:59:59+00', '2026-04-19 11:30:00+00', false),
(30, '2026-04-26 00:00:00+00', '2026-04-28 23:59:59+00', '2026-04-26 11:30:00+00', false),
(31, '2026-05-03 00:00:00+00', '2026-05-05 23:59:59+00', '2026-05-03 11:30:00+00', false),
(32, '2026-05-10 00:00:00+00', '2026-05-12 23:59:59+00', '2026-05-10 11:30:00+00', false),
(33, '2026-05-17 00:00:00+00', '2026-05-19 23:59:59+00', '2026-05-17 11:30:00+00', false),
(34, '2026-05-24 00:00:00+00', '2026-05-26 23:59:59+00', '2026-05-24 11:30:00+00', false),
(35, '2026-05-31 00:00:00+00', '2026-06-02 23:59:59+00', '2026-05-31 11:30:00+00', false),
(36, '2026-06-07 00:00:00+00', '2026-06-09 23:59:59+00', '2026-06-07 11:30:00+00', false),
(37, '2026-06-14 00:00:00+00', '2026-06-16 23:59:59+00', '2026-06-14 11:30:00+00', false),
(38, '2026-06-21 00:00:00+00', '2026-06-23 23:59:59+00', '2026-06-21 11:30:00+00', false);

-- Now insert all fixtures for the season
-- This is a sample of gameweek 1 fixtures - in production you would insert all 380 fixtures
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
-- Gameweek 1 (Saturday, August 16, 2025)
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

-- For demonstration, add a few fixtures for gameweek 2 as well
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
-- Gameweek 2 (Saturday, August 23, 2025)
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Liverpool'), 
 (SELECT id FROM teams WHERE name = 'Arsenal'), 
 '2025-08-23 12:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Manchester City'), 
 (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion'), 
 '2025-08-23 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Everton'), 
 (SELECT id FROM teams WHERE name = 'Chelsea'), 
 '2025-08-23 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'West Ham United'), 
 (SELECT id FROM teams WHERE name = 'Fulham'), 
 '2025-08-23 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Manchester United'), 
 (SELECT id FROM teams WHERE name = 'Crystal Palace'), 
 '2025-08-23 15:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers'), 
 (SELECT id FROM teams WHERE name = 'Leeds United'), 
 '2025-08-23 17:30:00+00', 'scheduled'),
-- Sunday, August 24, 2025
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Newcastle United'), 
 (SELECT id FROM teams WHERE name = 'Aston Villa'), 
 '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Nottingham Forest'), 
 (SELECT id FROM teams WHERE name = 'Burnley'), 
 '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'AFC Bournemouth'), 
 (SELECT id FROM teams WHERE name = 'Sunderland'), 
 '2025-08-24 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), 
 (SELECT id FROM teams WHERE name = 'Brentford'), 
 (SELECT id FROM teams WHERE name = 'Tottenham Hotspur'), 
 '2025-08-24 16:30:00+00', 'scheduled');
