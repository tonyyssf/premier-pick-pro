
-- Enable Row Level Security on the standings table
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for standings table

-- Global standings: Users can view all global standings (where league_id IS NULL)
CREATE POLICY "Anyone can view global standings" 
  ON public.standings 
  FOR SELECT 
  TO authenticated 
  USING (league_id IS NULL);

-- League standings: Users can view standings for leagues they belong to
CREATE POLICY "Users can view league standings for leagues they belong to" 
  ON public.standings 
  FOR SELECT 
  TO authenticated 
  USING (
    league_id IS NOT NULL AND 
    public.is_league_member(auth.uid(), league_id)
  );

-- System can manage all standings (for automated scoring and ranking updates)
CREATE POLICY "System can manage all standings" 
  ON public.standings 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
