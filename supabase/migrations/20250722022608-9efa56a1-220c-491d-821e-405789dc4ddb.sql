-- Add RLS policies to the fixtures table for security
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view fixtures (read-only public data)
CREATE POLICY "Anyone can view fixtures" 
ON public.fixtures 
FOR SELECT 
USING (true);

-- Only admins can manage fixtures data
CREATE POLICY "Admins can manage fixtures" 
ON public.fixtures 
FOR ALL 
TO authenticated 
USING (is_admin())
WITH CHECK (is_admin());