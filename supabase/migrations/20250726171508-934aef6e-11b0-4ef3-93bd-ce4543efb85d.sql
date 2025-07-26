-- Clean up duplicate teams without touching views
-- Phase 1: Update team colors for teams that don't have them or need corrections
UPDATE teams SET team_color = '#DA4E30' WHERE name = 'AFC Bournemouth';
UPDATE teams SET team_color = '#0054A6' WHERE name = 'Brighton' OR name = 'Brighton & Hove Albion';
UPDATE teams SET team_color = '#CC0000' WHERE name = 'Fulham'; -- Changed from white to red for visibility
UPDATE teams SET team_color = '#FFCD00' WHERE name = 'Leeds' OR name = 'Leeds United';
UPDATE teams SET team_color = '#6CABDD' WHERE name = 'Man City' OR name = 'Manchester City';
UPDATE teams SET team_color = '#DA020E' WHERE name = 'Man Utd' OR name = 'Manchester United';
UPDATE teams SET team_color = '#241F20' WHERE name = 'Newcastle' OR name = 'Newcastle United';
UPDATE teams SET team_color = '#DD0000' WHERE name = 'Nott''m Forest' OR name = 'Nottingham Forest';
UPDATE teams SET team_color = '#132257' WHERE name = 'Spurs' OR name = 'Tottenham Hotspur';
UPDATE teams SET team_color = '#7A263A' WHERE name = 'West Ham' OR name = 'West Ham United';
UPDATE teams SET team_color = '#FDB462' WHERE name = 'Wolves' OR name = 'Wolverhampton Wanderers';

-- Phase 2: Update user_picks to reference canonical team names
UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'AFC Bournemouth' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Bournemouth' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Brighton' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Leeds United' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Leeds' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Manchester City' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Man City' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Manchester United' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Man Utd' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Newcastle United' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Newcastle' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Nottingham Forest' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Nott''m Forest' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Tottenham Hotspur' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Spurs' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'West Ham United' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'West Ham' LIMIT 1);

UPDATE user_picks SET 
  picked_team_id = (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers' LIMIT 1)
WHERE picked_team_id = (SELECT id FROM teams WHERE name = 'Wolves' LIMIT 1);

-- Phase 3: Delete duplicate teams
DELETE FROM teams WHERE name IN ('Bournemouth', 'Brighton', 'Leeds', 'Man City', 'Man Utd', 'Newcastle', 'Nott''m Forest', 'Spurs', 'West Ham', 'Wolves');

-- Phase 4: Add colors for any remaining teams that might be missing
UPDATE teams SET team_color = '#FF6B00' WHERE name = 'Ipswich Town' AND team_color IS NULL;
UPDATE teams SET team_color = '#F47920' WHERE name = 'Luton Town' AND team_color IS NULL;
UPDATE teams SET team_color = '#EBE40A' WHERE name = 'Sheffield United' AND team_color IS NULL;
UPDATE teams SET team_color = '#00549F' WHERE name = 'Leicester City' AND team_color IS NULL;