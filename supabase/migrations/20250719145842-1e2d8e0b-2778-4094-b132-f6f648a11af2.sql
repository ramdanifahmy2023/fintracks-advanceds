
-- Step 1: Clean up conflicting data
-- First, let's see what we have and clean up inconsistencies

-- Remove all existing users from the custom users table
DELETE FROM public.users;

-- Clean up auth.users (remove test users that were manually inserted)
-- Note: This will only work for users that were created via INSERT, not through proper signup
DELETE FROM auth.users WHERE email IN ('admin@hiban.com', 'manager@hiban.com');

-- Step 2: Update the trigger function to handle the password_hash issue
-- Since we're using Supabase Auth, we don't need password_hash in our custom users table
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Step 3: Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer', -- Default role
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block the signup
  RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create a function to update user roles (for admin use)
CREATE OR REPLACE FUNCTION public.update_user_role(target_email TEXT, new_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_found BOOLEAN := FALSE;
BEGIN
  UPDATE public.users 
  SET role = new_role, updated_at = NOW()
  WHERE email = target_email;
  
  GET DIAGNOSTICS user_found = FOUND;
  RETURN user_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
