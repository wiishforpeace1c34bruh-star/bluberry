-- Add custom title fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_title text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title_color text;

-- Create badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_svg text NOT NULL,
  gradient_from text DEFAULT '217 91% 60%',
  gradient_to text DEFAULT '263 90% 51%',
  category text DEFAULT 'general',
  is_role_badge boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  equipped boolean DEFAULT false,
  obtained_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Public badges are viewable by everyone') THEN
        CREATE POLICY "Public badges are viewable by everyone" ON badges FOR SELECT USING (true);
    END IF;
END $$;

-- Policies for user_badges
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Public user badges are viewable by everyone') THEN
        CREATE POLICY "Public user badges are viewable by everyone" ON user_badges FOR SELECT USING (true);
    END IF;
END $$;

-- Policies for profiles update (ensure user can update their own title)
-- Assumes existing policy covers "Users can update own profile", but just in case:
-- CHECK constraint on title length could be added here or in app logic.
