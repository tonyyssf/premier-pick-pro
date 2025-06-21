
-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Allow every user to manage (read/update) ONLY their own profile
CREATE POLICY "profiles – self select"
ON public.profiles
FOR SELECT
USING ( auth.uid() = id );

CREATE POLICY "profiles – self update"
ON public.profiles
FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- Allow users to READ profiles of league-mates (shares at least one league)
CREATE POLICY "profiles – read league-mates"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM   public.league_members lm_self
    JOIN   public.league_members lm_other
           ON lm_self.league_id = lm_other.league_id
    WHERE  lm_self.user_id  = auth.uid()   -- me
      AND  lm_other.user_id = profiles.id  -- profile row I'm trying to read
  )
);

-- Create an index to optimize the league membership lookups
CREATE INDEX IF NOT EXISTS league_members_league_user_idx
ON public.league_members (league_id, user_id);
