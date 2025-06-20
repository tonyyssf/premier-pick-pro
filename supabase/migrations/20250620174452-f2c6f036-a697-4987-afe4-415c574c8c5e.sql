
-- Create admin role system for secure admin access
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- RLS policy for user_roles (only admins can manage roles)
CREATE POLICY "Admins can manage all user roles" 
  ON public.user_roles 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Add admin access policies to existing tables
CREATE POLICY "Admins can manage teams" 
  ON public.teams 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Admins can manage gameweeks" 
  ON public.gameweeks 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Admins can manage fixtures" 
  ON public.fixtures 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Admins can view all gameweek scores" 
  ON public.gameweek_scores 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Admins can manage gameweek scores" 
  ON public.gameweek_scores 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update gameweek scores" 
  ON public.gameweek_scores 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

-- Add missing RLS policies for user_picks (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_picks' AND policyname = 'Users can create their own picks') THEN
    EXECUTE 'CREATE POLICY "Users can create their own picks" ON public.user_picks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_picks' AND policyname = 'Users can update their own picks') THEN
    EXECUTE 'CREATE POLICY "Users can update their own picks" ON public.user_picks FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_picks' AND policyname = 'Users can delete their own picks') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own picks" ON public.user_picks FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Add RLS policies for profiles (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id)';
  END IF;
END $$;
