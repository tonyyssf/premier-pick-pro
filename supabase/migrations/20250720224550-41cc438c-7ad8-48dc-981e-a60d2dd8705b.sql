-- Clear existing fixtures to start fresh
TRUNCATE TABLE fixtures CASCADE;

-- First, ensure we have the correct Premier League teams for 2025/26
-- Update teams for Premier League 2025/26 season
INSERT INTO teams (name, short_name, team_color) VALUES 
('Leicester City', 'LEI', '#003090'),
('Ipswich Town', 'IPS', '#2E5F99'),
('Southampton', 'SOU', '#D71920')
ON CONFLICT (name) DO NOTHING;

-- Remove relegated teams and add promoted teams if needed
DELETE FROM teams WHERE name IN ('Burnley', 'Leeds United', 'Luton Town', 'Sheffield United', 'Sunderland');

-- Function to get team ID by name
CREATE OR REPLACE FUNCTION get_team_id(team_name TEXT) 
RETURNS UUID AS $$
DECLARE
    team_uuid UUID;
BEGIN
    SELECT id INTO team_uuid FROM teams WHERE name = team_name;
    IF team_uuid IS NULL THEN
        RAISE EXCEPTION 'Team not found: %', team_name;
    END IF;
    RETURN team_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert fixtures for Gameweek 1 (August 17, 2025)
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Arsenal'), get_team_id('Wolverhampton Wanderers'), '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Brighton & Hove Albion'), get_team_id('Everton'), '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Chelsea'), get_team_id('Crystal Palace'), '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Leicester City'), get_team_id('Tottenham Hotspur'), '2025-08-17 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Manchester City'), get_team_id('Newcastle United'), '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Nottingham Forest'), get_team_id('AFC Bournemouth'), '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('West Ham United'), get_team_id('Aston Villa'), '2025-08-17 16:30:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Liverpool'), get_team_id('Brentford'), '2025-08-18 16:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Southampton'), get_team_id('Fulham'), '2025-08-18 16:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 1), get_team_id('Manchester United'), get_team_id('Ipswich Town'), '2025-08-18 16:00:00+00', 'scheduled');

-- Insert fixtures for Gameweek 2 (August 24, 2025)
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Aston Villa'), get_team_id('Arsenal'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Brentford'), get_team_id('Crystal Palace'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Everton'), get_team_id('Brighton & Hove Albion'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Fulham'), get_team_id('Leicester City'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Ipswich Town'), get_team_id('Liverpool'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Newcastle United'), get_team_id('AFC Bournemouth'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Nottingham Forest'), get_team_id('West Ham United'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Tottenham Hotspur'), get_team_id('Everton'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Wolverhampton Wanderers'), get_team_id('Chelsea'), '2025-08-24 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 2), get_team_id('Southampton'), get_team_id('Manchester United'), '2025-08-24 14:00:00+00', 'scheduled');

-- Insert fixtures for Gameweek 3 (August 31, 2025)
INSERT INTO fixtures (gameweek_id, home_team_id, away_team_id, kickoff_time, status) VALUES 
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Arsenal'), get_team_id('Brighton & Hove Albion'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('AFC Bournemouth'), get_team_id('Southampton'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Chelsea'), get_team_id('Nottingham Forest'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Crystal Palace'), get_team_id('Aston Villa'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Everton'), get_team_id('Wolverhampton Wanderers'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Leicester City'), get_team_id('Ipswich Town'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Liverpool'), get_team_id('Manchester United'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Manchester City'), get_team_id('West Ham United'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Newcastle United'), get_team_id('Tottenham Hotspur'), '2025-08-31 14:00:00+00', 'scheduled'),
((SELECT id FROM gameweeks WHERE number = 3), get_team_id('Fulham'), get_team_id('Brentford'), '2025-08-31 14:00:00+00', 'scheduled');

-- Drop the helper function
DROP FUNCTION get_team_id(TEXT);