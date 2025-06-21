
-- Grant admin access to the user with email anthonyyoussef22@gmail.com
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::user_role
FROM auth.users 
WHERE email = 'anthonyyoussef22@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
