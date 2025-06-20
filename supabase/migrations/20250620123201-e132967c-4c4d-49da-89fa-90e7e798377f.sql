
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gameweeks table
CREATE TABLE public.gameweeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fixtures table
CREATE TABLE public.fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gameweek_id UUID REFERENCES public.gameweeks(id) NOT NULL,
  home_team_id UUID REFERENCES public.teams(id) NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) NOT NULL,
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, finished, postponed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update user_picks table to reference fixtures and teams properly
ALTER TABLE public.user_picks 
DROP COLUMN team_id,
DROP COLUMN team_name,
DROP COLUMN opponent,
DROP COLUMN venue,
DROP COLUMN gameweek;

ALTER TABLE public.user_picks 
ADD COLUMN fixture_id UUID REFERENCES public.fixtures(id) NOT NULL,
ADD COLUMN picked_team_id UUID REFERENCES public.teams(id) NOT NULL,
ADD COLUMN gameweek_id UUID REFERENCES public.gameweeks(id) NOT NULL;

-- Add RLS policies for new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Teams are public data - everyone can read
CREATE POLICY "Teams are publicly readable" 
  ON public.teams 
  FOR SELECT 
  USING (true);

-- Gameweeks are public data - everyone can read
CREATE POLICY "Gameweeks are publicly readable" 
  ON public.gameweeks 
  FOR SELECT 
  USING (true);

-- Fixtures are public data - everyone can read
CREATE POLICY "Fixtures are publicly readable" 
  ON public.fixtures 
  FOR SELECT 
  USING (true);

-- Insert sample Premier League teams
INSERT INTO public.teams (name, short_name, logo_url) VALUES
('Arsenal', 'ARS', ''),
('Aston Villa', 'AVL', ''),
('Bournemouth', 'BOU', ''),
('Brentford', 'BRE', ''),
('Brighton & Hove Albion', 'BHA', ''),
('Chelsea', 'CHE', ''),
('Crystal Palace', 'CRY', ''),
('Everton', 'EVE', ''),
('Fulham', 'FUL', ''),
('Liverpool', 'LIV', ''),
('Luton Town', 'LUT', ''),
('Manchester City', 'MCI', ''),
('Manchester United', 'MUN', ''),
('Newcastle United', 'NEW', ''),
('Nottingham Forest', 'NFO', ''),
('Sheffield United', 'SHU', ''),
('Tottenham Hotspur', 'TOT', ''),
('West Ham United', 'WHU', ''),
('Wolverhampton Wanderers', 'WOL', ''),
('Burnley', 'BUR', '');

-- Insert current gameweek (Gameweek 15)
INSERT INTO public.gameweeks (number, start_date, end_date, deadline, is_current) VALUES
(15, '2024-12-07 00:00:00+00', '2024-12-09 23:59:59+00', '2024-12-07 12:30:00+00', true);

-- Insert sample fixtures for Gameweek 15
WITH gameweek_15 AS (
  SELECT id FROM public.gameweeks WHERE number = 15
),
team_ids AS (
  SELECT name, id FROM public.teams
)
INSERT INTO public.fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time) 
SELECT 
  gw.id as gameweek_id,
  ht.id as home_team_id,
  at.id as away_team_id,
  '2024-12-07 15:00:00+00'::timestamp with time zone as kickoff_time
FROM gameweek_15 gw
CROSS JOIN (
  VALUES 
    ('Arsenal', 'Chelsea'),
    ('Manchester City', 'Liverpool'),
    ('Manchester United', 'Tottenham Hotspur'),
    ('Newcastle United', 'Brighton & Hove Albion'),
    ('Aston Villa', 'Brentford'),
    ('Crystal Palace', 'Everton'),
    ('Fulham', 'West Ham United'),
    ('Nottingham Forest', 'Wolverhampton Wanderers'),
    ('Sheffield United', 'Burnley'),
    ('Bournemouth', 'Luton Town')
) AS matches(home_team, away_team)
JOIN team_ids ht ON ht.name = matches.home_team
JOIN team_ids at ON at.name = matches.away_team;
