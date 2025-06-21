
-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every hour to check for gameweek completion
-- and automatically advance if all fixtures are finished
SELECT cron.schedule(
  'auto-advance-gameweek',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/auto-advance-gameweek',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2ZqeHRleXJqbmloZW1lemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjE0MjIsImV4cCI6MjA2NTk5NzQyMn0.iTMDpa3feA_fxNZF2J3tiVRN3dJZWoEE1MJwFxOx4N8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a more frequent cron job that runs every 30 minutes during peak hours (Friday-Monday)
-- to check for gameweek completion more frequently during match days
SELECT cron.schedule(
  'frequent-gameweek-check',
  '*/30 * * * 5,6,0,1', -- every 30 minutes on Friday, Saturday, Sunday, Monday
  $$
  SELECT
    net.http_post(
        url:='https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/auto-advance-gameweek',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2ZqeHRleXJqbmloZW1lemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjE0MjIsImV4cCI6MjA2NTk5NzQyMn0.iTMDpa3feA_fxNZF2J3tiVRN3dJZWoEE1MJwFxOx4N8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
