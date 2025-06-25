
-- Fix the foreign key constraint issue by ensuring profiles exist and updating the constraint
-- First, let's make sure we have a proper handle_new_user function and trigger

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.leagues DROP CONSTRAINT IF EXISTS leagues_creator_id_fkey;

-- Recreate the foreign key constraint to reference auth.users directly instead of profiles
-- This is safer as auth.users is managed by Supabase and always exists when a user signs up
ALTER TABLE public.leagues 
ADD CONSTRAINT leagues_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure we have a proper trigger to create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone_number'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for any existing users who might not have profiles
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
  au.id, 
  au.email,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
