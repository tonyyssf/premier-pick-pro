-- Add onboarding tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_dismissed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_dismissed_at TIMESTAMP WITH TIME ZONE NULL;

-- Create index for better performance on onboarding queries
CREATE INDEX idx_profiles_onboarding ON public.profiles(onboarding_completed, onboarding_dismissed) WHERE onboarding_completed = FALSE;