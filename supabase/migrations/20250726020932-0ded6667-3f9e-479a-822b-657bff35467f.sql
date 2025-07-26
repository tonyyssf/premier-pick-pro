-- Create RPC function to get insights data for premium analytics
CREATE OR REPLACE FUNCTION public.rpc_get_insights(target_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  insights_data jsonb;
  heatmap_data jsonb;
  efficiency_data jsonb;
  projection_data jsonb;
  team_record RECORD;
  gameweek_record RECORD;
  user_total_points INTEGER := 0;
  user_max_possible INTEGER := 0;
  user_correct_picks INTEGER := 0;
  user_total_picks INTEGER := 0;
  avg_points_per_gameweek DECIMAL;
  remaining_gameweeks INTEGER;
  current_gw_number INTEGER;
  projection_p25 INTEGER;
  projection_p50 INTEGER;
  projection_p75 INTEGER;
BEGIN
  -- Get current gameweek number
  SELECT number INTO current_gw_number 
  FROM gameweeks 
  WHERE is_current = true 
  LIMIT 1;
  
  IF current_gw_number IS NULL THEN
    current_gw_number := 1;
  END IF;
  
  -- Calculate user totals from standings
  SELECT 
    COALESCE(total_points, 0),
    COALESCE(correct_picks, 0),
    COALESCE(total_picks, 0)
  INTO user_total_points, user_correct_picks, user_total_picks
  FROM standings 
  WHERE user_id = target_user_id AND league_id IS NULL;
  
  -- Calculate max possible points (3 points per pick)
  user_max_possible := user_total_picks * 3;
  
  -- Build heatmap data (team win probabilities based on historical performance)
  heatmap_data := jsonb_build_array();
  FOR team_record IN 
    SELECT 
      t.id,
      t.name,
      t.short_name,
      COUNT(CASE WHEN 
        (f.home_team_id = t.id AND f.home_score > f.away_score) OR
        (f.away_team_id = t.id AND f.away_score > f.home_score)
      THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100 as win_percentage
    FROM teams t
    LEFT JOIN fixtures f ON (f.home_team_id = t.id OR f.away_team_id = t.id)
      AND f.status = 'finished'
    GROUP BY t.id, t.name, t.short_name
    ORDER BY t.name
  LOOP
    heatmap_data := heatmap_data || jsonb_build_object(
      'team', team_record.short_name,
      'winProbability', COALESCE(team_record.win_percentage, 45)
    );
  END LOOP;
  
  -- Build efficiency data (points earned vs max possible by gameweek)
  efficiency_data := jsonb_build_array();
  FOR gameweek_record IN
    SELECT 
      gw.number,
      COALESCE(gs.points, 0) as points_earned,
      (SELECT COUNT(*) FROM user_picks up 
       JOIN fixtures f ON up.fixture_id = f.id 
       WHERE up.user_id = target_user_id AND up.gameweek_id = gw.id) * 3 as max_possible
    FROM gameweeks gw
    LEFT JOIN gameweek_scores gs ON gs.gameweek_id = gw.id AND gs.user_id = target_user_id
    WHERE gw.number <= current_gw_number
    ORDER BY gw.number
  LOOP
    efficiency_data := efficiency_data || jsonb_build_object(
      'gameweek', gameweek_record.number,
      'pointsEarned', gameweek_record.points_earned,
      'maxPossible', COALESCE(gameweek_record.max_possible, 0),
      'efficiency', 
      CASE 
        WHEN COALESCE(gameweek_record.max_possible, 0) > 0 
        THEN (gameweek_record.points_earned::DECIMAL / gameweek_record.max_possible * 100)
        ELSE 0 
      END
    );
  END LOOP;
  
  -- Calculate projections based on average points per gameweek
  remaining_gameweeks := GREATEST(38 - current_gw_number, 0);
  
  IF user_total_picks > 0 THEN
    avg_points_per_gameweek := user_total_points::DECIMAL / GREATEST(current_gw_number, 1);
  ELSE
    avg_points_per_gameweek := 1.5; -- Conservative estimate
  END IF;
  
  -- Calculate projection percentiles (simplified model)
  projection_p50 := user_total_points + ROUND(avg_points_per_gameweek * remaining_gameweeks);
  projection_p25 := user_total_points + ROUND(avg_points_per_gameweek * remaining_gameweeks * 0.8);
  projection_p75 := user_total_points + ROUND(avg_points_per_gameweek * remaining_gameweeks * 1.2);
  
  projection_data := jsonb_build_object(
    'p25', projection_p25,
    'p50', projection_p50,
    'p75', projection_p75,
    'currentPoints', user_total_points,
    'averagePerGameweek', ROUND(avg_points_per_gameweek, 1)
  );
  
  -- Combine all insights
  insights_data := jsonb_build_object(
    'heatmap', heatmap_data,
    'efficiency', efficiency_data,
    'projections', projection_data,
    'currentGameweek', current_gw_number,
    'totalPoints', user_total_points,
    'correctPicks', user_correct_picks,
    'totalPicks', user_total_picks,
    'winRate', 
    CASE 
      WHEN user_total_picks > 0 
      THEN ROUND((user_correct_picks::DECIMAL / user_total_picks * 100), 1)
      ELSE 0 
    END
  );
  
  RETURN insights_data;
END;
$function$