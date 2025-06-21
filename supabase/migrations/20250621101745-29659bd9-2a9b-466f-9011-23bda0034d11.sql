
-- Update all SECURITY DEFINER functions to set proper search_path for security
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT nspname AS schema, proname AS name, pg_proc.oid, pg_get_function_identity_arguments(pg_proc.oid) AS args
    FROM pg_proc
    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    WHERE proname IN (
      'add_creator_to_league','is_league_public','is_league_member',
      'handle_new_user','update_all_scores','generate_invite_code',
      'is_league_creator','calculate_gameweek_scores','check_gameweek_completion',
      'advance_to_next_gameweek','is_admin'
    )
    AND nspname = 'public'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path TO public, pg_catalog;',
      rec.schema, rec.name, rec.args
    );
  END LOOP;
END $$;

-- Create a security definer function to safely check extension availability
CREATE OR REPLACE FUNCTION public.check_extension_security()
RETURNS TABLE(extension_name text, schema_name text, security_note text)
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
      WHEN n.nspname = 'public' THEN 'Consider if this extension needs public access'
      ELSE 'Extension properly isolated'
    END::text
  FROM pg_extension e
  JOIN pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname IN ('pg_net', 'uuid-ossp', 'pgcrypto');
END;
$$;

-- Add comments to document the security measures
COMMENT ON FUNCTION public.add_creator_to_league() IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.is_league_public(uuid) IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.is_league_member(uuid, uuid) IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.is_league_creator(uuid, uuid) IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.calculate_gameweek_scores(uuid) IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.check_gameweek_completion(uuid) IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.advance_to_next_gameweek() IS 'SECURITY DEFINER function with restricted search_path';
COMMENT ON FUNCTION public.is_admin(uuid) IS 'SECURITY DEFINER function with restricted search_path';
