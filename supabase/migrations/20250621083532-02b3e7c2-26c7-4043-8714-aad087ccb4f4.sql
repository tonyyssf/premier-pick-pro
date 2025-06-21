
-- Add phone number and SMS preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN sms_reminders_enabled BOOLEAN DEFAULT false,
ADD COLUMN country_code TEXT DEFAULT '+1';

-- Create index on phone number for better performance
CREATE INDEX idx_profiles_phone_number ON public.profiles(phone_number);

-- Create a table to track SMS reminders sent
CREATE TABLE public.sms_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gameweek_id UUID REFERENCES gameweeks(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'sent',
  provider_message_id TEXT,
  UNIQUE(user_id, gameweek_id)
);

-- Enable RLS on sms_reminders table
ALTER TABLE public.sms_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_reminders
CREATE POLICY "Users can view their own SMS reminders" 
  ON public.sms_reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert SMS reminders" 
  ON public.sms_reminders 
  FOR INSERT 
  WITH CHECK (true);

-- Update the handle_new_user function to include phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, name, phone_number)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  RETURN NEW;
END;
$$;
