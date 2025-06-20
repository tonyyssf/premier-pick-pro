
-- Create leagues table
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create league_members table
CREATE TABLE public.league_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for leagues
CREATE POLICY "Users can view public leagues and leagues they're members of" 
  ON public.leagues 
  FOR SELECT 
  USING (
    is_public = true OR 
    creator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM league_members 
      WHERE league_id = leagues.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own leagues" 
  ON public.leagues 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "League creators can update their leagues" 
  ON public.leagues 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "League creators can delete their leagues" 
  ON public.leagues 
  FOR DELETE 
  USING (auth.uid() = creator_id);

-- RLS policies for league_members
CREATE POLICY "Users can view league members for leagues they belong to" 
  ON public.league_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM leagues 
      WHERE id = league_id AND (
        creator_id = auth.uid() OR 
        is_public = true OR
        EXISTS (
          SELECT 1 FROM league_members lm2 
          WHERE lm2.league_id = league_id AND lm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join leagues" 
  ON public.league_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leagues or creators can remove members" 
  ON public.league_members 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM leagues 
      WHERE id = league_id AND creator_id = auth.uid()
    )
  );

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substr(md5(random()::text), 1, 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM leagues WHERE invite_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Set default value for invite_code
ALTER TABLE public.leagues ALTER COLUMN invite_code SET DEFAULT generate_invite_code();
