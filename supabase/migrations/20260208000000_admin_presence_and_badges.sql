-- Add last_seen_at to profiles for real-time presence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index for faster presence queries
CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx ON public.profiles(last_seen_at);

-- Insert the Verified Admin "Shield" badge if it doesn't exist
-- Assuming a 'badges' table exists based on previous work
INSERT INTO public.badges (id, name, description, icon_url, type)
VALUES (
    'admin-shield-badge', 
    'Verified Admin', 
    'Official Sapphire Administrator', 
    'shield', 
    'exclusive'
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Only admins can manage channels
-- Assuming 'channels' table exists
DROP POLICY IF EXISTS "Admins can manage channels" ON public.channels;
CREATE POLICY "Admins can manage channels" ON public.channels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND (profiles.is_admin = true OR profiles.id IN (SELECT profile_id FROM admin_roles))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND (profiles.is_admin = true OR profiles.id IN (SELECT profile_id FROM admin_roles))
        )
    );
