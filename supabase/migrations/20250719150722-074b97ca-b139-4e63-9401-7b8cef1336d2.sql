-- Step 1: Remove the password_hash column that's causing issues
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Step 2: Clean up existing corrupted data
DELETE FROM public.users;

-- Step 3: Temporarily disable the trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create test users in auth.users with specific passwords
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'admin.demo@hibanstore.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Super Administrator"}', false, 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'admin.hiban.demo@gmail.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Admin Hiban Store"}', false, 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'manager.demo@hibanstore.com', crypt('manager123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Store Manager"}', false, 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'viewer.demo@hibanstore.com', crypt('viewer123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Data Viewer"}', false, 'authenticated');

-- Step 5: Create corresponding profiles in public.users
INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  CASE email
    WHEN 'admin.demo@hibanstore.com' THEN 'super_admin'
    WHEN 'admin.hiban.demo@gmail.com' THEN 'admin'
    WHEN 'manager.demo@hibanstore.com' THEN 'manager'
    WHEN 'viewer.demo@hibanstore.com' THEN 'viewer'
  END,
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE email IN ('admin.demo@hibanstore.com', 'admin.hiban.demo@gmail.com', 'manager.demo@hibanstore.com', 'viewer.demo@hibanstore.com');

-- Step 6: Re-enable the trigger for future signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();