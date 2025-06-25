
-- Fix the ranking logic to ensure ranks start from 1
CREATE OR REPLACE FUNCTION public.refresh_all_rankings()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh global rankings using ROW_NUMBER() to ensure sequential numbering starting from 1
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (
        ORDER BY 
          total_points DESC, 
          correct_picks DESC, 
          user_id ASC
      ) as new_rank
    FROM standings
    WHERE league_id IS NULL
  )
  UPDATE standings 
  SET current_rank = ranked_users.new_rank,
      updated_at = now()
  FROM ranked_users
  WHERE standings.user_id = ranked_users.user_id
  AND standings.league_id IS NULL;

  -- Refresh league-specific rankings using ROW_NUMBER() with PARTITION BY
  WITH ranked_league_users AS (
    SELECT 
      league_id,
      user_id,
      ROW_NUMBER() OVER (
        PARTITION BY league_id 
        ORDER BY 
          total_points DESC, 
          correct_picks DESC, 
          user_id ASC
      ) as new_rank
    FROM standings
    WHERE league_id IS NOT NULL
  )
  UPDATE standings 
  SET current_rank = ranked_league_users.new_rank,
      updated_at = now()
  FROM ranked_league_users
  WHERE standings.league_id = ranked_league_users.league_id 
  AND standings.user_id = ranked_league_users.user_id;

  -- Log the refresh for monitoring
  RAISE NOTICE 'Rankings refreshed at %', now();
END;
$$;

-- Call the function to immediately fix the current ranking
SELECT refresh_all_rankings();
