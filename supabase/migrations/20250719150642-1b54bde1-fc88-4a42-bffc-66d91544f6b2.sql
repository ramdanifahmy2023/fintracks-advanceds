-- Clean up existing corrupted data
DELETE FROM public.users;

-- Create test users in auth.users and corresponding profiles
-- Using Supabase's admin functions to create users with specific passwords

-- Function to create a test user with specific credentials
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create user in auth.users with specific password
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
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object('full_name', user_full_name),
    false,
    'authenticated'
  ) RETURNING id INTO new_user_id;

  -- Create corresponding profile in public.users
  INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (new_user_id, user_email, user_full_name, user_role, true, NOW(), NOW());

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the test users
SELECT create_test_user('admin.demo@hibanstore.com', 'admin123', 'Super Administrator', 'super_admin');
SELECT create_test_user('admin.hiban.demo@gmail.com', 'admin123', 'Admin Hiban Store', 'admin');
SELECT create_test_user('manager.demo@hibanstore.com', 'manager123', 'Store Manager', 'manager');
SELECT create_test_user('viewer.demo@hibanstore.com', 'viewer123', 'Data Viewer', 'viewer');

-- Clean up the function
DROP FUNCTION create_test_user(TEXT, TEXT, TEXT, TEXT);