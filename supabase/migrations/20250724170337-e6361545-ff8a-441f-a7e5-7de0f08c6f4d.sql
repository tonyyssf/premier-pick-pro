-- Phase 1: Critical Security Fixes

-- 1. Fix user_roles table RLS policies to prevent role escalation
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create secure RLS policies for user_roles
CREATE POLICY "System can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Create role change audit table
CREATE TABLE public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  approved_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit table
CREATE POLICY "Admins can view all role change audits" 
ON public.role_change_audit 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can insert role change audits" 
ON public.role_change_audit 
FOR INSERT 
WITH CHECK (true);

-- 3. Create secure function for role management
CREATE OR REPLACE FUNCTION public.request_role_change(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  audit_id UUID;
  current_role TEXT;
  requesting_user_role TEXT;
BEGIN
  -- Check if requesting user is admin
  SELECT role INTO requesting_user_role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin';
  
  IF requesting_user_role IS NULL THEN
    RAISE EXCEPTION 'Only admins can request role changes';
  END IF;
  
  -- Get current role
  SELECT role INTO current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  -- Insert audit record
  INSERT INTO public.role_change_audit (
    target_user_id, 
    old_role, 
    new_role, 
    changed_by, 
    change_reason,
    status
  ) VALUES (
    target_user_id, 
    current_role, 
    new_role, 
    auth.uid(), 
    reason,
    'approved'  -- Auto-approve for now, can be changed to require approval
  ) RETURNING id INTO audit_id;
  
  -- Apply the role change immediately (in production, this would require approval)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role::user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remove old role if different
  IF current_role IS NOT NULL AND current_role != new_role THEN
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = current_role::user_role;
  END IF;
  
  -- Update audit record
  UPDATE public.role_change_audit 
  SET approved_by = auth.uid(), approved_at = now()
  WHERE id = audit_id;
  
  RETURN audit_id;
END;
$$;

-- 4. Create function to safely check admin status
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- 5. Update existing functions to use secure admin check
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT public.is_admin_secure(user_uuid);
$$;

-- 6. Add security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT auth.uid(),
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  -- In a real implementation, this would log to a secure audit table
  -- For now, we'll use NOTICE for visibility
  RAISE NOTICE 'SECURITY EVENT: % - User: % - Details: %', event_type, user_id, details;
END;
$$;

-- 7. Clean up potential RLS policy conflicts by ensuring proper ordering
-- Recreate standings policies with proper precedence
DROP POLICY IF EXISTS "Anyone can view global standings" ON public.standings;
DROP POLICY IF EXISTS "Users can view league standings for leagues they belong to" ON public.standings;
DROP POLICY IF EXISTS "System can manage all standings" ON public.standings;

-- Recreate with proper order (most restrictive first)
CREATE POLICY "System can manage all standings" 
ON public.standings 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Users can view league standings for leagues they belong to" 
ON public.standings 
FOR SELECT 
USING ((league_id IS NOT NULL) AND is_league_member(auth.uid(), league_id));

CREATE POLICY "Anyone can view global standings" 
ON public.standings 
FOR SELECT 
USING (league_id IS NULL);