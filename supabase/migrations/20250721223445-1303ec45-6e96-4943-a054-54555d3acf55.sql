
-- Fix the ambiguous column reference in get_app_fixtures_for_gameweek function
CREATE OR REPLACE FUNCTION get_app_fixtures_for_gameweek(gw_id uuid)
RETURNS TABLE (
  id uuid,
  gameweek_id uuid,
  home_team_id uuid,
  away_team_id uuid,
  kickoff_time timestamp with time zone,
  status text,
  home_score integer,
  away_score integer,
  home_team_name text,
  home_team_short_name text,
  home_team_color text,
  away_team_name text,
  away_team_short_name text,
  away_team_color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid() as id,
    gw_id as gameweek_id,
    ht.id as home_team_id,
    at.id as away_team_id,
    CASE 
      WHEN f."Date" ~ '^\d{2}/\d{2}/\d{4}$' THEN 
        (f."Date"::date + interval '15:00')::timestamp with time zone
      ELSE 
        now()::timestamp with time zone
    END as kickoff_time,
    CASE 
      WHEN f."Result" IS NOT NULL AND f."Result" != '' THEN 'finished'
      ELSE 'scheduled'
    END as status,
    NULL::integer as home_score,
    NULL::integer as away_score,
    f."Home Team" as home_team_name,
    ht.short_name as home_team_short_name,
    ht.team_color as home_team_color,
    f."Away Team" as away_team_name,
    at.short_name as away_team_short_name,
    at.team_color as away_team_color
  FROM fixtures f
  LEFT JOIN teams ht ON ht.name = f."Home Team"
  LEFT JOIN teams at ON at.name = f."Away Team"
  WHERE f."Round Number" = (
    SELECT gameweeks.number FROM gameweeks WHERE gameweeks.id = gw_id
  );
END;
$$;

-- Update team names in the teams table to match the fixtures data
UPDATE teams SET name = 'Manchester City' WHERE name = 'Man City';
UPDATE teams SET name = 'Manchester United' WHERE name = 'Man United';
UPDATE teams SET name = 'Tottenham Hotspur' WHERE name = 'Tottenham';
UPDATE teams SET name = 'Brighton & Hove Albion' WHERE name = 'Brighton';
UPDATE teams SET name = 'Nottingham Forest' WHERE name = "Nott'm Forest";
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
