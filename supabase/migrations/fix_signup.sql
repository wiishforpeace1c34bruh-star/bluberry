-- FIX SIGNUP ISSUES: Server-side Trigger
-- This script adds a trigger to automatically create a profile when a user signs up.
-- This bypasses RLS issues because the trigger runs with system privileges.

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id,
    -- Get username from metadata, or generate a default one if missing
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent errors if already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER = Runs as Admin

-- 2. Attach the trigger to new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
