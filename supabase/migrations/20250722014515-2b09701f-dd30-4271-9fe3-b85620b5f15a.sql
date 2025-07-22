CREATE OR REPLACE FUNCTION public.get_app_fixtures_for_gameweek(gw_id uuid)
 RETURNS TABLE(id uuid, gameweek_id uuid, home_team_id uuid, away_team_id uuid, kickoff_time timestamp with time zone, status text, home_score integer, away_score integer, home_team_name text, home_team_short_name text, home_team_color text, away_team_name text, away_team_short_name text, away_team_color text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid() as fixture_id,
    gw_id as gameweek_id,
    ht.id as home_team_id,
    at.id as away_team_id,
    -- Parse the date and time properly from the fixtures table
    CASE 
      WHEN f."Date" ~ '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}$' THEN 
        TO_TIMESTAMP(f."Date", 'DD/MM/YYYY HH24:MI')::timestamp with time zone
      WHEN f."Date" ~ '^\d{2}/\d{2}/\d{4}$' THEN 
        (TO_DATE(f."Date", 'DD/MM/YYYY') + interval '15:00')::timestamp with time zone
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
$function$