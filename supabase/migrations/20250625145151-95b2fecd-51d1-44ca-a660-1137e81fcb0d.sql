
-- Check for and resolve duplicate entries in the standings table
-- First, let's see what duplicates exist
DO $$
DECLARE
  duplicate_count INTEGER;
  total_global_entries INTEGER;
BEGIN
  -- Count duplicate global standings
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as entry_count
    FROM standings
    WHERE league_id IS NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  SELECT COUNT(*) INTO total_global_entries
  FROM standings
  WHERE league_id IS NULL;
  
  RAISE NOTICE 'Found % users with duplicate global standings out of % total entries', duplicate_count, total_global_entries;
  
  -- If duplicates exist, clean them up
  IF duplicate_count > 0 THEN
    -- Keep only the newest entry for each user_id (by created_at)
    DELETE FROM standings
    WHERE id NOT IN (
      SELECT DISTINCT ON (user_id) id
      FROM standings
      WHERE league_id IS NULL
      ORDER BY user_id, created_at DESC
    )
    AND league_id IS NULL;
    
    RAISE NOTICE 'Cleaned up duplicate global standings entries';
  END IF;
  
  -- Now refresh rankings to ensure proper sequential ranking
  PERFORM refresh_all_rankings();
  
  RAISE NOTICE 'Rankings refreshed after cleanup';
END $$;
