
-- Drop ALL existing policies first to ensure clean state
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view gameweeks" ON public.gameweeks;
DROP POLICY IF EXISTS "Anyone can view fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "Users can view their own gameweek scores" ON public.gameweek_scores;
DROP POLICY IF EXISTS "Users can view gameweek scores for leagues they belong to" ON public.gameweek_scores;
DROP POLICY IF EXISTS "System can manage gameweek scores" ON public.gameweek_scores;
DROP POLICY IF EXISTS "Users can view their own standings" ON public.user_standings;
DROP POLICY IF EXISTS "Users can view standings for league members" ON public.user_standings;
DROP POLICY IF EXISTS "System can manage user standings" ON public.user_standings;
DROP POLICY IF EXISTS "Users can view league standings for leagues they belong to" ON public.league_standings;
DROP POLICY IF EXISTS "System can manage league standings" ON public.league_standings;
DROP POLICY IF EXISTS "Users can view public leagues" ON public.leagues;
DROP POLICY IF EXISTS "Users can view leagues they created" ON public.leagues;
DROP POLICY IF EXISTS "Users can view leagues they belong to" ON public.leagues;
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON public.leagues;
DROP POLICY IF EXISTS "League creators can update their leagues" ON public.leagues;
DROP POLICY IF EXISTS "League creators can delete their leagues" ON public.leagues;
DROP POLICY IF EXISTS "Users can view their own picks" ON public.user_picks;
DROP POLICY IF EXISTS "Users can view picks from league members" ON public.user_picks;
DROP POLICY IF EXISTS "Users can create their own picks" ON public.user_picks;
DROP POLICY IF EXISTS "Users can update their own picks" ON public.user_picks;
DROP POLICY IF EXISTS "Users can delete their own picks" ON public.user_picks;
DROP POLICY IF EXISTS "Users can view league members for leagues they belong to" ON public.league_members;
DROP POLICY IF EXISTS "Users can join public leagues" ON public.league_members;
DROP POLICY IF EXISTS "Users can leave leagues or creators can remove members" ON public.league_members;

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweek_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for teams table
CREATE POLICY "Anyone can view teams" 
  ON public.teams 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create comprehensive RLS policies for gameweeks table  
CREATE POLICY "Anyone can view gameweeks" 
  ON public.gameweeks 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create comprehensive RLS policies for fixtures table
CREATE POLICY "Anyone can view fixtures" 
  ON public.fixtures 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create comprehensive RLS policies for gameweek_scores table
CREATE POLICY "Users can view their own gameweek scores" 
  ON public.gameweek_scores 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view gameweek scores for leagues they belong to" 
  ON public.gameweek_scores 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm 
      WHERE lm.user_id = auth.uid() 
      AND lm.league_id IN (
        SELECT ls.league_id FROM public.league_standings ls 
        WHERE ls.user_id = public.gameweek_scores.user_id
      )
    )
  );

CREATE POLICY "System can manage gameweek scores" 
  ON public.gameweek_scores 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for user_standings table
CREATE POLICY "Users can view their own standings" 
  ON public.user_standings 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view standings for league members" 
  ON public.user_standings 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm1 
      INNER JOIN public.league_members lm2 ON lm1.league_id = lm2.league_id
      WHERE lm1.user_id = auth.uid() 
      AND lm2.user_id = public.user_standings.user_id
    )
  );

CREATE POLICY "System can manage user standings" 
  ON public.user_standings 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for league_standings table
CREATE POLICY "Users can view league standings for leagues they belong to" 
  ON public.league_standings 
  FOR SELECT 
  TO authenticated 
  USING (
    public.is_league_member(auth.uid(), league_id)
  );

CREATE POLICY "System can manage league standings" 
  ON public.league_standings 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for leagues table
CREATE POLICY "Users can view public leagues" 
  ON public.leagues 
  FOR SELECT 
  TO authenticated 
  USING (is_public = true);

CREATE POLICY "Users can view leagues they created" 
  ON public.leagues 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can view leagues they belong to" 
  ON public.leagues 
  FOR SELECT 
  TO authenticated 
  USING (
    public.is_league_member(auth.uid(), id)
  );

CREATE POLICY "Authenticated users can create leagues" 
  ON public.leagues 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "League creators can update their leagues" 
  ON public.leagues 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = creator_id);

CREATE POLICY "League creators can delete their leagues" 
  ON public.leagues 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = creator_id);

-- Create comprehensive RLS policies for user_picks table
CREATE POLICY "Users can view their own picks" 
  ON public.user_picks 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view picks from league members" 
  ON public.user_picks 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm1 
      INNER JOIN public.league_members lm2 ON lm1.league_id = lm2.league_id
      WHERE lm1.user_id = auth.uid() 
      AND lm2.user_id = public.user_picks.user_id
    )
  );

CREATE POLICY "Users can create their own picks" 
  ON public.user_picks 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own picks" 
  ON public.user_picks 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own picks" 
  ON public.user_picks 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Update league_members policies
CREATE POLICY "Users can view league members for leagues they belong to" 
  ON public.league_members 
  FOR SELECT 
  TO authenticated 
  USING (
    public.is_league_member(auth.uid(), league_id) OR 
    public.is_league_creator(auth.uid(), league_id)
  );

CREATE POLICY "Users can join public leagues" 
  ON public.league_members 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND 
    (public.is_league_public(league_id) OR public.is_league_creator(auth.uid(), league_id))
  );

CREATE POLICY "Users can leave leagues or creators can remove members" 
  ON public.league_members 
  FOR DELETE 
  TO authenticated 
  USING (
    auth.uid() = user_id OR 
    public.is_league_creator(auth.uid(), league_id)
  );
