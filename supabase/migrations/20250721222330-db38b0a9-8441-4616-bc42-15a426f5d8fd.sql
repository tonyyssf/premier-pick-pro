
-- Step 1: First, let's check what's in the current fixtures table and update teams to match
-- Update team names in the teams table to match the fixtures table exactly
UPDATE teams SET name = 'Arsenal' WHERE name = 'Arsenal';
UPDATE teams SET name = 'Wolverhampton Wanderers' WHERE name = 'Wolves' OR name = 'Wolverhampton Wanderers';
UPDATE teams SET name = 'Brighton & Hove Albion' WHERE name = 'Brighton' OR name = 'Brighton & Hove Albion';
UPDATE teams SET name = 'Everton' WHERE name = 'Everton';
UPDATE teams SET name = 'Chelsea' WHERE name = 'Chelsea';
UPDATE teams SET name = 'Manchester City' WHERE name = 'Man City' OR name = 'Manchester City';
UPDATE teams SET name = 'Crystal Palace' WHERE name = 'Crystal Palace';
UPDATE teams SET name = 'West Ham United' WHERE name = 'West Ham' OR name = 'West Ham United';
UPDATE teams SET name = 'Fulham' WHERE name = 'Fulham';
UPDATE teams SET name = 'Manchester United' WHERE name = 'Man United' OR name = 'Manchester United';
UPDATE teams SET name = 'Liverpool' WHERE name = 'Liverpool';
UPDATE teams SET name = 'Aston Villa' WHERE name = 'Aston Villa';
UPDATE teams SET name = 'Newcastle United' WHERE name = 'Newcastle' OR name = 'Newcastle United';
UPDATE teams SET name = 'Nottingham Forest' WHERE name = 'Nott\'m Forest' OR name = 'Nottingham Forest';
UPDATE teams SET name = 'AFC Bournemouth' WHERE name = 'Bournemouth' OR name = 'AFC Bournemouth';
UPDATE teams SET name = 'Tottenham Hotspur' WHERE name = 'Tottenham' OR name = 'Tottenham Hotspur';
UPDATE teams SET name = 'Brentford' WHERE name = 'Brentford';

-- Insert any missing teams that might be in the fixtures but not in teams table
INSERT INTO teams (name, short_name, team_color) VALUES 
('Burnley', 'BUR', '#6C1D45'),
('Sunderland', 'SUN', '#EB172B'), 
('Leeds United', 'LEE', '#FFCD00')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Add the required columns to fixtures table if they don't exist
ALTER TABLE fixtures 
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

-- Step 3: Ensure we have gameweek 1 properly set up
INSERT INTO gameweeks (number, start_date, end_date, deadline, is_current) VALUES 
(1, '2025-08-16 00:00:00+00', '2025-08-17 23:59:59+00', '2025-08-16 11:30:00+00', true)
ON CONFLICT (number) DO UPDATE SET 
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  deadline = EXCLUDED.deadline,
  is_current = EXCLUDED.is_current,
  updated_at = now();

-- Step 4: Update fixtures with proper relationships - map team names to IDs and set gameweek
UPDATE fixtures 
SET 
  gameweek_id = (SELECT id FROM gameweeks WHERE number = 1),
  home_team_id = (SELECT id FROM teams WHERE name = fixtures."Home Team"),
  away_team_id = (SELECT id FROM teams WHERE name = fixtures."Away Team"),
  kickoff_time = CASE 
    WHEN "Match Number" = 1 THEN '2025-08-16 12:30:00+00'::timestamp with time zone
    WHEN "Match Number" IN (2, 3, 4, 5) THEN '2025-08-16 15:00:00+00'::timestamp with time zone
    WHEN "Match Number" = 6 THEN '2025-08-16 17:30:00+00'::timestamp with time zone
    WHEN "Match Number" IN (7, 8) THEN '2025-08-17 14:00:00+00'::timestamp with time zone
    WHEN "Match Number" IN (9, 10) THEN '2025-08-17 16:30:00+00'::timestamp with time zone
    ELSE '2025-08-16 15:00:00+00'::timestamp with time zone
  END,
  status = 'scheduled'
WHERE "Match Number" <= 10;

-- Step 5: Add constraints and indexes
-- Add primary key if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fixtures_pkey') THEN
    ALTER TABLE fixtures ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fixtures_gameweek_id_fkey') THEN
    ALTER TABLE fixtures 
    ADD CONSTRAINT fixtures_gameweek_id_fkey 
    FOREIGN KEY (gameweek_id) REFERENCES gameweeks(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fixtures_home_team_id_fkey') THEN
    ALTER TABLE fixtures 
    ADD CONSTRAINT fixtures_home_team_id_fkey 
    FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fixtures_away_team_id_fkey') THEN
    ALTER TABLE fixtures 
    ADD CONSTRAINT fixtures_away_team_id_fkey 
    FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Enable RLS and create policies if not exists
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fixtures' AND policyname = 'Anyone can view fixtures') THEN
    CREATE POLICY "Anyone can view fixtures" 
    ON fixtures 
    FOR SELECT 
    USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fixtures' AND policyname = 'Admins can manage fixtures') THEN
    CREATE POLICY "Admins can manage fixtures" 
    ON fixtures 
    FOR ALL 
    TO authenticated 
    USING (is_admin());
  END IF;
END $$;

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixtures_gameweek_id ON fixtures(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff_time ON fixtures(kickoff_time);

-- Step 8: Clean up any fixtures beyond gameweek 1 for now (we only want the first 10 matches)
DELETE FROM fixtures WHERE "Match Number" > 10;
