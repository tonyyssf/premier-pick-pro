-- Fix the quoting error and complete the team name updates
UPDATE teams SET name = 'Nottingham Forest' WHERE name = 'Nott''m Forest';

-- Ensure all other team name mappings are applied correctly
UPDATE teams SET name = 'Manchester City' WHERE name = 'Man City';
UPDATE teams SET name = 'Manchester United' WHERE name = 'Man United';
UPDATE teams SET name = 'Tottenham Hotspur' WHERE name = 'Tottenham';
UPDATE teams SET name = 'Brighton & Hove Albion' WHERE name = 'Brighton';
UPDATE teams SET name = 'Newcastle United' WHERE name = 'Newcastle';
UPDATE teams SET name = 'West Ham United' WHERE name = 'West Ham';

-- Insert any missing teams that exist in fixtures but not in teams table
INSERT INTO teams (name, short_name, team_color)
SELECT DISTINCT f."Home Team", 
       CASE 
         WHEN f."Home Team" = 'Manchester City' THEN 'MCI'
         WHEN f."Home Team" = 'Manchester United' THEN 'MUN'
         WHEN f."Home Team" = 'Tottenham Hotspur' THEN 'TOT'
         WHEN f."Home Team" = 'Brighton & Hove Albion' THEN 'BHA'
         WHEN f."Home Team" = 'Nottingham Forest' THEN 'NFO'
         WHEN f."Home Team" = 'Newcastle United' THEN 'NEW'
         WHEN f."Home Team" = 'West Ham United' THEN 'WHU'
         ELSE UPPER(LEFT(f."Home Team", 3))
       END,
       '#6B7280'
FROM fixtures f
WHERE f."Home Team" NOT IN (SELECT name FROM teams)

UNION

SELECT DISTINCT f."Away Team",
       CASE 
         WHEN f."Away Team" = 'Manchester City' THEN 'MCI'
         WHEN f."Away Team" = 'Manchester United' THEN 'MUN'
         WHEN f."Away Team" = 'Tottenham Hotspur' THEN 'TOT'
         WHEN f."Away Team" = 'Brighton & Hove Albion' THEN 'BHA'
         WHEN f."Away Team" = 'Nottingham Forest' THEN 'NFO'
         WHEN f."Away Team" = 'Newcastle United' THEN 'NEW'
         WHEN f."Away Team" = 'West Ham United' THEN 'WHU'
         ELSE UPPER(LEFT(f."Away Team", 3))
       END,
       '#6B7280'
FROM fixtures f
WHERE f."Away Team" NOT IN (SELECT name FROM teams);