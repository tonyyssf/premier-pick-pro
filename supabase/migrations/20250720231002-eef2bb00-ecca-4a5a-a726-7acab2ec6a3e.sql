-- Drop the fixtures table completely
DROP TABLE IF EXISTS fixtures CASCADE;

-- Recreate the fixtures table from scratch
CREATE TABLE public.fixtures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gameweek_id UUID NOT NULL,
  home_team_id UUID NOT NULL,
  away_team_id UUID NOT NULL,
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_gameweek_id_fkey 
FOREIGN KEY (gameweek_id) REFERENCES public.gameweeks(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_home_team_id_fkey 
FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.fixtures 
ADD CONSTRAINT fixtures_away_team_id_fkey 
FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view fixtures" 
ON public.fixtures 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage fixtures" 
ON public.fixtures 
FOR ALL 
TO authenticated 
USING (is_admin());

-- Add indexes for better performance
CREATE INDEX idx_fixtures_gameweek_id ON public.fixtures(gameweek_id);
CREATE INDEX idx_fixtures_home_team_id ON public.fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team_id ON public.fixtures(away_team_id);
CREATE INDEX idx_fixtures_kickoff_time ON public.fixtures(kickoff_time);