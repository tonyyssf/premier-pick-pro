
-- Step 1: Add the missing columns to the existing fixtures table
ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS gameweek_id UUID,
ADD COLUMN IF NOT EXISTS home_team_id UUID,
ADD COLUMN IF NOT EXISTS away_team_id UUID,
ADD COLUMN IF NOT EXISTS kickoff_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS home_score INTEGER,
ADD COLUMN IF NOT EXISTS away_score INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Step 2: Populate the new columns with data from existing columns
-- First, ensure we have gameweek 1 created
INSERT INTO gameweeks (number, start_date, end_date, deadline, is_current) VALUES 
(1, '2025-08-16 00:00:00+00', '2025-08-17 23:59:59+00', '2025-08-16 11:30:00+00', true)
ON CONFLICT (number) DO UPDATE SET 
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  deadline = EXCLUDED.deadline,
  is_current = EXCLUDED.is_current,
  updated_at = now();

-- Step 3: Update the fixtures with proper data
-- Set gameweek_id for all fixtures (assuming they're all gameweek 1)
UPDATE public.fixtures 
SET gameweek_id = (SELECT id FROM gameweeks WHERE number = 1)
WHERE gameweek_id IS NULL;

-- Step 4: Map team names to team IDs and set kickoff times
UPDATE public.fixtures SET
  home_team_id = teams_home.id,
  away_team_id = teams_away.id,
  kickoff_time = CASE 
    WHEN "Match Number" = 1 THEN '2025-08-16 12:30:00+00'::timestamp with time zone
    WHEN "Match Number" IN (2, 3, 4, 5) THEN '2025-08-16 15:00:00+00'::timestamp with time zone
    WHEN "Match Number" = 6 THEN '2025-08-16 17:30:00+00'::timestamp with time zone
    WHEN "Match Number" IN (7, 8) THEN '2025-08-17 14:00:00+00'::timestamp with time zone
    WHEN "Match Number" IN (9, 10) THEN '2025-08-17 16:30:00+00'::timestamp with time zone
    ELSE '2025-08-16 15:00:00+00'::timestamp with time zone
  END,
  status = 'scheduled'
FROM teams AS teams_home, teams AS teams_away
WHERE teams_home.name = fixtures."Home Team"
  AND teams_away.name = fixtures."Away Team";

-- Step 5: Set primary key constraint
ALTER TABLE public.fixtures DROP CONSTRAINT IF EXISTS fixtures_pkey;
ALTER TABLE public.fixtures ADD PRIMARY KEY (id);

-- Step 6: Add foreign key constraints
ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_gameweek_id_fkey 
FOREIGN KEY (gameweek_id) REFERENCES public.gameweeks(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_home_team_id_fkey 
FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_away_team_id_fkey 
FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Step 7: Enable Row Level Security
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
CREATE POLICY "Anyone can view fixtures" 
ON public.fixtures 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage fixtures" 
ON public.fixtures 
FOR ALL 
TO authenticated 
USING (is_admin());

-- Step 9: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fixtures_gameweek_id ON public.fixtures(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON public.fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON public.fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff_time ON public.fixtures(kickoff_time);

-- Step 10: Clean up - drop old columns after confirming the new ones work
-- (We'll keep them for now to be safe, but you can remove them later)
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Match Number";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Round Number";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Date";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Location";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Home Team";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Away Team";
-- ALTER TABLE public.fixtures DROP COLUMN IF EXISTS "Result";
