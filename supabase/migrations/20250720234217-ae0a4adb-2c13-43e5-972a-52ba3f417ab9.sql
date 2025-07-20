-- Fix the team mappings with correct name matching
UPDATE public.fixtures SET
  home_team_id = CASE 
    WHEN "Home Team" = 'Arsenal' THEN (SELECT id FROM teams WHERE name = 'Arsenal')
    WHEN "Home Team" = 'Aston Villa' THEN (SELECT id FROM teams WHERE name = 'Aston Villa')
    WHEN "Home Team" = 'Bournemouth' THEN (SELECT id FROM teams WHERE name = 'AFC Bournemouth')
    WHEN "Home Team" = 'Brentford' THEN (SELECT id FROM teams WHERE name = 'Brentford')
    WHEN "Home Team" = 'Brighton' THEN (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion')
    WHEN "Home Team" = 'Burnley' THEN (SELECT id FROM teams WHERE name = 'Burnley')
    WHEN "Home Team" = 'Chelsea' THEN (SELECT id FROM teams WHERE name = 'Chelsea')
    WHEN "Home Team" = 'Crystal Palace' THEN (SELECT id FROM teams WHERE name = 'Crystal Palace')
    WHEN "Home Team" = 'Everton' THEN (SELECT id FROM teams WHERE name = 'Everton')
    WHEN "Home Team" = 'Fulham' THEN (SELECT id FROM teams WHERE name = 'Fulham')
    WHEN "Home Team" = 'Leeds' THEN (SELECT id FROM teams WHERE name = 'Leeds United')
    WHEN "Home Team" = 'Liverpool' THEN (SELECT id FROM teams WHERE name = 'Liverpool')
    WHEN "Home Team" = 'Man City' THEN (SELECT id FROM teams WHERE name = 'Manchester City')
    WHEN "Home Team" = 'Man Utd' THEN (SELECT id FROM teams WHERE name = 'Manchester United')
    WHEN "Home Team" = 'Newcastle' THEN (SELECT id FROM teams WHERE name = 'Newcastle United')
    WHEN "Home Team" = 'Nott''m Forest' THEN (SELECT id FROM teams WHERE name = 'Nottingham Forest')
    WHEN "Home Team" = 'Spurs' THEN (SELECT id FROM teams WHERE name = 'Tottenham Hotspur')
    WHEN "Home Team" = 'Sunderland' THEN (SELECT id FROM teams WHERE name = 'Sunderland')
    WHEN "Home Team" = 'West Ham' THEN (SELECT id FROM teams WHERE name = 'West Ham United')
    WHEN "Home Team" = 'Wolves' THEN (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers')
    ELSE home_team_id
  END,
  away_team_id = CASE 
    WHEN "Away Team" = 'Arsenal' THEN (SELECT id FROM teams WHERE name = 'Arsenal')
    WHEN "Away Team" = 'Aston Villa' THEN (SELECT id FROM teams WHERE name = 'Aston Villa')
    WHEN "Away Team" = 'Bournemouth' THEN (SELECT id FROM teams WHERE name = 'AFC Bournemouth')
    WHEN "Away Team" = 'Brentford' THEN (SELECT id FROM teams WHERE name = 'Brentford')
    WHEN "Away Team" = 'Brighton' THEN (SELECT id FROM teams WHERE name = 'Brighton & Hove Albion')
    WHEN "Away Team" = 'Burnley' THEN (SELECT id FROM teams WHERE name = 'Burnley')
    WHEN "Away Team" = 'Chelsea' THEN (SELECT id FROM teams WHERE name = 'Chelsea')
    WHEN "Away Team" = 'Crystal Palace' THEN (SELECT id FROM teams WHERE name = 'Crystal Palace')
    WHEN "Away Team" = 'Everton' THEN (SELECT id FROM teams WHERE name = 'Everton')
    WHEN "Away Team" = 'Fulham' THEN (SELECT id FROM teams WHERE name = 'Fulham')
    WHEN "Away Team" = 'Leeds' THEN (SELECT id FROM teams WHERE name = 'Leeds United')
    WHEN "Away Team" = 'Liverpool' THEN (SELECT id FROM teams WHERE name = 'Liverpool')
    WHEN "Away Team" = 'Man City' THEN (SELECT id FROM teams WHERE name = 'Manchester City')
    WHEN "Away Team" = 'Man Utd' THEN (SELECT id FROM teams WHERE name = 'Manchester United')
    WHEN "Away Team" = 'Newcastle' THEN (SELECT id FROM teams WHERE name = 'Newcastle United')
    WHEN "Away Team" = 'Nott''m Forest' THEN (SELECT id FROM teams WHERE name = 'Nottingham Forest')
    WHEN "Away Team" = 'Spurs' THEN (SELECT id FROM teams WHERE name = 'Tottenham Hotspur')
    WHEN "Away Team" = 'Sunderland' THEN (SELECT id FROM teams WHERE name = 'Sunderland')
    WHEN "Away Team" = 'West Ham' THEN (SELECT id FROM teams WHERE name = 'West Ham United')
    WHEN "Away Team" = 'Wolves' THEN (SELECT id FROM teams WHERE name = 'Wolverhampton Wanderers')
    ELSE away_team_id
  END
WHERE "Home Team" IS NOT NULL AND "Away Team" IS NOT NULL;