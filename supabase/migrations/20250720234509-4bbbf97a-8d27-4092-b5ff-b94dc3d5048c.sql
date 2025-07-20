-- First, make the "Match Number" column nullable or set a default
ALTER TABLE fixtures ALTER COLUMN "Match Number" DROP NOT NULL;

-- Delete all existing fixtures
DELETE FROM fixtures;

-- Insert only the correct 10 fixtures for Gameweek 1
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status, "Match Number") VALUES 
-- Saturday, August 16, 2025
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Arsenal'), 
 (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers'), 
 '2025-08-16 12:30:00+00', 'scheduled', 1),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion'), 
 (SELECT id FROM teams WHERE name = 'Everton'), 
 '2025-08-16 15:00:00+00', 'scheduled', 2),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Chelsea'), 
 (SELECT id FROM teams WHERE name = 'Manchester City'), 
 '2025-08-16 15:00:00+00', 'scheduled', 3),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Crystal Palace'), 
 (SELECT id FROM teams WHERE name = 'West Ham United'), 
 '2025-08-16 15:00:00+00', 'scheduled', 4),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Fulham'), 
 (SELECT id FROM teams WHERE name = 'Manchester United'), 
 '2025-08-16 15:00:00+00', 'scheduled', 5),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Leeds United'), 
 (SELECT id FROM teams WHERE name = 'Liverpool'), 
 '2025-08-16 17:30:00+00', 'scheduled', 6),
-- Sunday, August 17, 2025
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Aston Villa'), 
 (SELECT id FROM teams WHERE name = 'Newcastle United'), 
 '2025-08-17 14:00:00+00', 'scheduled', 7),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Burnley'), 
 (SELECT id FROM teams WHERE name = 'Nottingham Forest'), 
 '2025-08-17 14:00:00+00', 'scheduled', 8),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Sunderland'), 
 (SELECT id FROM teams WHERE name = 'AFC Bournemouth'), 
 '2025-08-17 16:30:00+00', 'scheduled', 9),
((SELECT id FROM gameweeks WHERE number = 1), 
 (SELECT id FROM teams WHERE name = 'Tottenham Hotspur'), 
 (SELECT id FROM teams WHERE name = 'Brentford'), 
 '2025-08-17 16:30:00+00', 'scheduled', 10);