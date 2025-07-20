-- Remove the incorrectly added promoted teams
DELETE FROM teams WHERE name IN ('Leicester City', 'Ipswich Town', 'Southampton');

-- Add the correct promoted teams for 2025/26 season
INSERT INTO teams (name, short_name, team_color) VALUES
('Sunderland', 'SUN', '#FF0000'),
('Burnley', 'BUR', '#7A003A'), 
('Leeds United', 'LEE', '#FFFFFF');