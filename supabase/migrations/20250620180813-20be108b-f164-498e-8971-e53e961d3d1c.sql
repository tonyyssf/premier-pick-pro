
-- Add team_color column to teams table
ALTER TABLE public.teams 
ADD COLUMN team_color TEXT;

-- Update teams with their primary colors
UPDATE public.teams SET team_color = '#EF0107' WHERE name = 'Arsenal';
UPDATE public.teams SET team_color = '#95BFE5' WHERE name = 'Aston Villa';
UPDATE public.teams SET team_color = '#DA020E' WHERE name = 'Bournemouth';
UPDATE public.teams SET team_color = '#E30613' WHERE name = 'Brentford';
UPDATE public.teams SET team_color = '#0057B8' WHERE name = 'Brighton & Hove Albion';
UPDATE public.teams SET team_color = '#034694' WHERE name = 'Chelsea';
UPDATE public.teams SET team_color = '#1B458F' WHERE name = 'Crystal Palace';
UPDATE public.teams SET team_color = '#003399' WHERE name = 'Everton';
UPDATE public.teams SET team_color = '#FFFFFF' WHERE name = 'Fulham';
UPDATE public.teams SET team_color = '#C8102E' WHERE name = 'Liverpool';
UPDATE public.teams SET team_color = '#F78F1E' WHERE name = 'Luton Town';
UPDATE public.teams SET team_color = '#6CABDD' WHERE name = 'Manchester City';
UPDATE public.teams SET team_color = '#DA020E' WHERE name = 'Manchester United';
UPDATE public.teams SET team_color = '#241F20' WHERE name = 'Newcastle United';
UPDATE public.teams SET team_color = '#DD0000' WHERE name = 'Nottingham Forest';
UPDATE public.teams SET team_color = '#EE2737' WHERE name = 'Sheffield United';
UPDATE public.teams SET team_color = '#132257' WHERE name = 'Tottenham Hotspur';
UPDATE public.teams SET team_color = '#7A263A' WHERE name = 'West Ham United';
UPDATE public.teams SET team_color = '#FDB462' WHERE name = 'Wolverhampton Wanderers';
UPDATE public.teams SET team_color = '#6C1D45' WHERE name = 'Burnley';
