
-- First, let's drop the problematic RLS policies for league_members
DROP POLICY IF EXISTS "Users can view league members for leagues they belong to" ON public.league_members;
DROP POLICY IF EXISTS "Users can leave leagues or creators can remove members" ON public.league_members;

-- Create a security definer function to check if user is league creator
CREATE OR REPLACE FUNCTION public.is_league_creator(_user_id uuid, _league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leagues 
    WHERE id = _league_id AND creator_id = _user_id
  );
$$;

-- Create a security definer function to check if league is public
CREATE OR REPLACE FUNCTION public.is_league_public(_league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT is_public FROM public.leagues WHERE id = _league_id), false);
$$;

-- Create a security definer function to check if user is league member
CREATE OR REPLACE FUNCTION public.is_league_member(_user_id uuid, _league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members 
    WHERE league_id = _league_id AND user_id = _user_id
  );
$$;

-- Now create new RLS policies using the security definer functions
CREATE POLICY "Users can view league members for accessible leagues" 
  ON public.league_members 
  FOR SELECT 
  USING (
    public.is_league_creator(auth.uid(), league_id) OR 
    public.is_league_public(league_id) OR
    public.is_league_member(auth.uid(), league_id)
  );

CREATE POLICY "Users can leave leagues or creators can remove members" 
  ON public.league_members 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.is_league_creator(auth.uid(), league_id)
  );
