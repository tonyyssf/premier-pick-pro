
-- First, drop the RLS policies that depend on the is_public column
DROP POLICY IF EXISTS "Users can view public leagues and leagues they're members of" ON public.leagues;
DROP POLICY IF EXISTS "Users can view public leagues" ON public.leagues;

-- Remove the is_public column from leagues table
ALTER TABLE public.leagues 
DROP COLUMN IF EXISTS is_public;

-- Update the default value for max_members to 20
ALTER TABLE public.leagues 
ALTER COLUMN max_members SET DEFAULT 20;

-- Update existing leagues that have max_members > 20 to be 20
UPDATE public.leagues 
SET max_members = 20 
WHERE max_members > 20;

-- Create new simplified RLS policies for leagues
-- Users can view leagues they are members of
CREATE POLICY "Users can view leagues they are members of" 
  ON public.leagues 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members 
      WHERE league_id = leagues.id AND user_id = auth.uid()
    )
  );

-- Users can create leagues
CREATE POLICY "Users can create leagues" 
  ON public.leagues 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

-- Users can update leagues they created
CREATE POLICY "Users can update their own leagues" 
  ON public.leagues 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Users can delete leagues they created
CREATE POLICY "Users can delete their own leagues" 
  ON public.leagues 
  FOR DELETE 
  USING (auth.uid() = creator_id);
