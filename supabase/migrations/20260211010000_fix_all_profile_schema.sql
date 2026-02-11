-- Comprehensive migration to fix profile schema issues and ensure all columns exist
-- This uses IF NOT EXISTS to be safe to run on any version of the DB

-- 1. Ensure basics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- 2. Ensure customization fields (this was likely the missing part causing the error)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title_color text;

-- 3. Ensure gradient fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gradient_from text DEFAULT '217 91% 60%';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gradient_to text DEFAULT '263 90% 51%';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_gradient boolean DEFAULT false;

-- 4. Ensure status fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_message text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_type text DEFAULT 'online';

-- 5. Ensure badge link
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_badge_id uuid;

-- 6. Ensure social links (JSONB)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- 7. Ensure statistics (if not present, though likely handled by triggers)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS games_played integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_play_time integer DEFAULT 0;

-- 8. Fix RLS policies if needed (ensure update policy covers these columns)
-- (Existing policies are usually ROW level, so strict column policies shouldn't be an issue unless defined)

-- 9. Create badges table if missing (referenced by foreign keys)
CREATE TABLE IF NOT EXISTS public.badges (
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

-- 10. Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Public badges are viewable by everyone') THEN
        CREATE POLICY "Public badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
    END IF;
END $$;
