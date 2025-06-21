
-- Grant admin access to the specific user account
INSERT INTO public.user_roles (user_id, role) 
VALUES ('6ddac02f-1784-4832-84a5-c71d53979b3f', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
