
-- Fix remaining security warnings by improving function security
-- Note: We cannot move pg_net extension as it's a system extension

-- 1. Update the generate_invite_code function to use SECURITY DEFINER with proper search_path
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code and ensure it's uppercase
    code := upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', '1'), 1, 6));
    
    -- Replace any special characters that might slip through
    code := regexp_replace(code, '[^A-Z0-9]', '0', 'g');
    
    -- Ensure we have exactly 6 characters
    code := lpad(code, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.leagues WHERE invite_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- 2. Add a function to audit extension usage for security monitoring
CREATE OR REPLACE FUNCTION public.audit_extension_usage()
RETURNS TABLE(
  extension_name text,
  schema_location text,
  security_recommendation text
)
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
      WHEN e.extname = 'pg_net' AND n.nspname = 'public' THEN 'System extension - monitor usage in functions'
      WHEN e.extname = 'uuid-ossp' AND n.nspname = 'public' THEN 'Consider using gen_random_uuid() instead'
      WHEN e.extname = 'pgcrypto' AND n.nspname = 'public' THEN 'Ensure cryptographic functions are used securely'
      ELSE 'Extension placement is acceptable'
    END::text
  FROM pg_extension e
  JOIN pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname IN ('pg_net', 'uuid-ossp', 'pgcrypto');
END;
$$;

-- 3. Add security monitoring for function usage
CREATE OR REPLACE FUNCTION public.security_audit_log()
RETURNS TABLE(
  function_name text,
  schema_name text,
  is_security_definer boolean,
  search_path_set boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text,
    n.nspname::text,
    p.prosecdef,
    (p.proconfig IS NOT NULL AND 'search_path' = ANY(
      SELECT split_part(unnest(p.proconfig), '=', 1)
    ))
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosecdef = true;
END;
$$;

-- 4. Update comments to reflect security measures
COMMENT ON FUNCTION public.generate_invite_code() IS 'SECURITY DEFINER function with restricted search_path for invite code generation';
COMMENT ON FUNCTION public.audit_extension_usage() IS 'Security monitoring function for extension usage';
COMMENT ON FUNCTION public.security_audit_log() IS 'Security audit function for monitoring SECURITY DEFINER functions';
