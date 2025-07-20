-- Clear existing fixtures and fix team data
TRUNCATE TABLE fixtures CASCADE;

-- Delete old teams and add proper Premier League teams for 2025/26
DELETE FROM teams WHERE name NOT IN (
  'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Liverpool', 
  'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest',
  'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
);

-- Add the promoted teams for 2025/26 season
INSERT INTO teams (name, short_name, team_color) VALUES 
('Leicester City', 'LEI', '#003090'),
('Ipswich Town', 'IPS', '#2E5F99'),
('Southampton', 'SOU', '#D71920');

-- Insert fixtures for Gameweek 1 (August 17, 2025)
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Arsenal'), 
 (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion'), 
 (SELECT id FROM teams WHERE name = 'Everton'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Chelsea'), 
 (SELECT id FROM teams WHERE name = 'Crystal Palace'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Leicester City'), 
 (SELECT id FROM teams WHERE name = 'Tottenham Hotspur'), 
 '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Manchester City'), 
 (SELECT id FROM teams WHERE name = 'Newcastle United'), 
 '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Nottingham Forest'), 
 (SELECT id FROM teams WHERE name = 'AFC Bournemouth'), 
 '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'West Ham United'), 
 (SELECT id FROM teams WHERE name = 'Aston Villa'), 
 '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Liverpool'), 
 (SELECT id FROM teams WHERE name = 'Brentford'), 
 '2025-08-18 16:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Southampton'), 
 (SELECT id FROM teams WHERE name = 'Fulham'), 
 '2025-08-18 16:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Manchester United'), 
 (SELECT id FROM teams WHERE name = 'Ipswich Town'), 
 '2025-08-18 16:00:00+00', 'scheduled');