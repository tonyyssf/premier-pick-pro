
-- Fix duplicate global standings issue
-- This migration ensures each user has only one global standings entry

-- First, identify and clean up duplicate global standings
DO $$
DECLARE
    standing_record RECORD;
    standings_to_keep UUID[];
    standings_to_delete UUID[];
BEGIN
    -- For each user with multiple global standings, keep only the best one
    FOR standing_record IN
        SELECT user_id, COUNT(*) as count
        FROM standings 
        WHERE league_id IS NULL 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    LOOP
        -- Get all standings for this user, ordered by rank (best first)
        SELECT ARRAY_AGG(id ORDER BY 
            CASE WHEN current_rank IS NULL THEN 999999 ELSE current_rank END ASC,
            total_points DESC,
            correct_picks DESC,
            created_at ASC
        ) INTO standings_to_keep
        FROM standings 
        WHERE user_id = standing_record.user_id 
        AND league_id IS NULL;
        
        -- Keep only the first (best) one
        SELECT ARRAY_AGG(id) INTO standings_to_delete
        FROM standings 
        WHERE user_id = standing_record.user_id 
        AND league_id IS NULL
        AND id != standings_to_keep[1];
        
        -- Delete the duplicates
        DELETE FROM standings 
        WHERE id = ANY(standings_to_delete);
        
        RAISE NOTICE 'Cleaned up % duplicate global standings for user %', 
                     array_length(standings_to_delete, 1), standing_record.user_id;
    END LOOP;
END $$;

-- Add a unique constraint to prevent future duplicates
-- This ensures each user can have only one global standings entry (where league_id IS NULL)
ALTER TABLE standings 
ADD CONSTRAINT unique_global_standings_per_user 
UNIQUE (user_id) 
WHERE (league_id IS NULL);

-- Create a partial index to support the constraint and improve performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_standings_unique_global_per_user 
ON standings (user_id) 
WHERE league_id IS NULL;

-- Update the initialize_user_standings function to handle the unique constraint
CREATE OR REPLACE FUNCTION public.initialize_user_standings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create global user standing if it doesn't exist (use ON CONFLICT DO NOTHING)
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.user_id, NULL, 0, 0, 0, 999)
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  -- Create league standing for the new member
  INSERT INTO standings (user_id, league_id, total_points, correct_picks, total_picks, current_rank)
  VALUES (NEW.user_id, NEW.league_id, 0, 0, 0, 999)
  ON CONFLICT (user_id, league_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh all rankings to ensure consistency
SELECT refresh_all_rankings();

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT unique_global_standings_per_user ON standings IS 
'Ensures each user has exactly one global standings entry (where league_id IS NULL)';
