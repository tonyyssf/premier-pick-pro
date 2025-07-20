
-- Remove the incorrect promoted teams
DELETE FROM teams WHERE name IN ('Ipswich Town', 'Leicester City', 'Southampton');

-- Add the correct promoted teams for 2025/26 season
INSERT INTO teams (name, short_name, team_color) VALUES
('Burnley', 'BUR', '#6C1D45'),
('Sunderland', 'SUN', '#EB172B'), 
('Leeds United', 'LEE', '#FFCD00');

-- Clear any existing fixtures to start fresh
TRUNCATE TABLE fixtures CASCADE;

-- Insert the correct Matchweek 1 fixtures for 2025/26 season
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
