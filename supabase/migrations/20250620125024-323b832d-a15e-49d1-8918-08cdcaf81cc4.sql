
-- Add a trigger function to automatically add league creator as member
CREATE OR REPLACE FUNCTION add_creator_to_league()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the creator as a member of the league they just created
  INSERT INTO public.league_members (league_id, user_id)
  VALUES (NEW.id, NEW.creator_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires after league insertion
CREATE TRIGGER after_league_created
  AFTER INSERT ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_to_league();
