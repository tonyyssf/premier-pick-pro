
-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from the public schema
DROP EXTENSION IF EXISTS pg_net;

-- Create the extension in the new extensions schema
CREATE EXTENSION pg_net SCHEMA extensions;

-- Verify the extension is correctly installed in the new schema
SELECT e.extname, n.nspname as schema_name 
FROM pg_extension e 
JOIN pg_namespace n ON e.extnamespace = n.oid 
WHERE e.extname = 'pg_net';

-- Update any existing cron jobs to use the correct schema reference
-- Since the cron jobs use net.http_post, we need to update the search path or use full schema qualification
-- Let's update the existing cron jobs to use the extensions schema
SELECT cron.unschedule('auto-advance-gameweek');
SELECT cron.unschedule('frequent-gameweek-check');

-- Recreate the cron jobs with proper schema reference
SELECT cron.schedule(
  'auto-advance-gameweek',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    extensions.http_post(
        url:='https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/auto-advance-gameweek',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2ZqeHRleXJqbmloZW1lemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjE0MjIsImV4cCI6MjA2NTk5NzQyMn0.iTMDpa3feA_fxNZF2J3tiVRN3dJZWoEE1MJwFxOx4N8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Recreate the frequent gameweek check with proper schema reference
SELECT cron.schedule(
  'frequent-gameweek-check',
  '*/30 * * * 5,6,0,1', -- every 30 minutes on Friday, Saturday, Sunday, Monday
  $$
  SELECT
    extensions.http_post(
        url:='https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/auto-advance-gameweek',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2ZqeHRleXJqbmloZW1lemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjE0MjIsImV4cCI6MjA2NTk5NzQyMn0.iTMDpa3feA_fxNZF2J3tiVRN3dJZWoEE1MJwFxOx4N8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Update the security audit functions to reflect the new extension schema
CREATE OR REPLACE FUNCTION public.audit_extension_usage()
RETURNS TABLE(extension_name text, schema_location text, security_recommendation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.extname::text,
    n.nspname::text,
    CASE 
      WHEN e.extname = 'pg_net' AND n.nspname = 'extensions' THEN 'Extension properly isolated in extensions schema'
      WHEN e.extname = 'pg_net' AND n.nspname = 'public' THEN 'SECURITY ISSUE: Move to extensions schema'
      WHEN e.extname = 'uuid-ossp' AND n.nspname = 'public' THEN 'Consider using gen_random_uuid() instead'
      WHEN e.extname = 'pgcrypto' AND n.nspname = 'public' THEN 'Ensure cryptographic functions are used securely'
      ELSE 'Extension placement is acceptable'
    END::text
  FROM pg_extension e
  JOIN pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname IN ('pg_net', 'uuid-ossp', 'pgcrypto');
END;
$$;

-- Add comment to document the security improvement
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security isolation';
