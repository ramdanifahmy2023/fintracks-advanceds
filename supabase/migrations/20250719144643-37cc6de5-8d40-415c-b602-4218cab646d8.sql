-- Create trigger function to auto-create user profiles
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profiles on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some test users for development (you can customize roles as needed)
INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin@hiban.com', 'Admin User', 'super_admin', true, NOW(), NOW()),
  (gen_random_uuid(), 'manager@hiban.com', 'Manager User', 'manager', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;