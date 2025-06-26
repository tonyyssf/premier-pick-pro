
# Site Down Runbook

## Quick Diagnostics
• Test health endpoint: `curl https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/health-check`
• Check Lovable status: https://status.lovable.dev
• Check Supabase status: https://status.supabase.com

## Troubleshooting Steps
• View Supabase function logs: https://supabase.com/dashboard/project/uocfjxteyrjnihemezgo/functions/health-check/logs
• Check database connectivity in Supabase SQL Editor
• Review recent deployments in Lovable project history

## Recovery Actions
• Revert to last working snapshot in Lovable (Project → History → Restore)
• Redeploy edge function if health-check is failing
• Contact support if infrastructure issues persist

## Verification
• Health endpoint should return `{"app":"ok","db":"ok"}` with 200 status
• Main app should be accessible at your domain
