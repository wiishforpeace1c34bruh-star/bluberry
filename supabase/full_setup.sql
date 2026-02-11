-- CLEANUP (Run this if you hit errors about 'already exists')
DROP TYPE IF EXISTS public.app_role CASCADE; 
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.patch_notes CASCADE;
DROP TABLE IF EXISTS public.game_files CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.user_spam_tracking CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.ticket_responses CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.chat_channels CASCADE;
DROP TABLE IF EXISTS public.dm_threads CASCADE;
DROP TABLE IF EXISTS public.dm_participants CASCADE;
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.gem_chat_history CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;

-- Drop Storage Policies (They persist even if tables are dropped)
DROP POLICY IF EXISTS "Game files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload game files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete game files" ON storage.objects;
DROP POLICY IF EXISTS "Profile assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile assets" ON storage.objects;

-- End Cleanup

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user data and leveling
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  games_played INTEGER NOT NULL DEFAULT 0,
  total_play_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create patch_notes table
CREATE TABLE public.patch_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_files table for admin uploads
CREATE TABLE public.game_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patch_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_files ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Patch notes policies (everyone can read, admins can write)
CREATE POLICY "Anyone can view patch notes"
  ON public.patch_notes FOR SELECT
  USING (true);

CREATE POLICY "Admins can create patch notes"
  ON public.patch_notes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update patch notes"
  ON public.patch_notes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete patch notes"
  ON public.patch_notes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Game files policies (everyone can read, admins can write)
CREATE POLICY "Anyone can view game files"
  ON public.game_files FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage game files"
  ON public.game_files FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for game files
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-files', 'game-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for game files
CREATE POLICY "Game files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-files');

CREATE POLICY "Admins can upload game files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'game-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete game files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'game-files' AND public.has_role(auth.uid(), 'admin'));

-- First: Add new enum values (must be committed separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'officer';

-- Badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_svg TEXT NOT NULL,
  gradient_from TEXT DEFAULT '217 91% 60%',
  gradient_to TEXT DEFAULT '263 90% 51%',
  category TEXT NOT NULL DEFAULT 'achievement',
  is_role_badge BOOLEAN NOT NULL DEFAULT false,
  role_for app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User equipped badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  gifted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, badge_id)
);

-- Profile customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gradient_from TEXT DEFAULT '217 91% 60%',
ADD COLUMN IF NOT EXISTS gradient_to TEXT DEFAULT '263 90% 51%',
ADD COLUMN IF NOT EXISTS show_gradient BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS equipped_badge_id UUID REFERENCES public.badges(id);

-- Chat messages table with moderation
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User spam tracking
CREATE TABLE public.user_spam_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_muted BOOLEAN NOT NULL DEFAULT false,
  muted_until TIMESTAMP WITH TIME ZONE,
  muted_by UUID REFERENCES auth.users(id)
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket responses
CREATE TABLE public.ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_staff_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Friends system
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable RLS on all tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spam_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view all user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can manage own badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can gift badges" ON public.user_badges FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin') OR auth.uid() = user_id
);
CREATE POLICY "Admins can delete badges" ON public.user_badges FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view non-deleted messages" ON public.chat_messages FOR SELECT USING (is_deleted = false OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can post messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Mods can delete messages" ON public.chat_messages FOR UPDATE USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'moderator') OR 
  has_role(auth.uid(), 'officer')
);

-- RLS Policies for spam tracking
CREATE POLICY "Users can view own spam status" ON public.user_spam_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage spam tracking" ON public.user_spam_tracking FOR ALL USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'moderator')
);

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'moderator') OR 
  has_role(auth.uid(), 'officer')
);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can manage tickets" ON public.support_tickets FOR UPDATE USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'moderator') OR 
  has_role(auth.uid(), 'officer')
);

-- RLS Policies for ticket responses
CREATE POLICY "Users can view ticket responses" ON public.ticket_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'officer')))
);
CREATE POLICY "Users can respond to tickets" ON public.ticket_responses FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'officer')))
);

-- RLS Policies for friendships
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friendship status" ON public.friendships FOR UPDATE USING (auth.uid() = friend_id OR auth.uid() = user_id);
CREATE POLICY "Users can remove friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert default badges
INSERT INTO public.badges (name, description, icon_svg, gradient_from, gradient_to, category, is_role_badge, role_for) VALUES
-- Role badges
('Admin Shield', 'Administrator of Sapphire', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg>', '217 91% 60%', '263 90% 51%', 'role', true, 'admin'),
('Officer Hammer', 'Community Officer', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', '45 93% 47%', '38 92% 50%', 'role', true, 'officer'),
('Moderator Guard', 'Community Moderator', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', '142 71% 45%', '160 84% 39%', 'role', true, 'moderator'),
-- Rank badges
('Sapphire Gem', 'Premium member', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', '217 91% 60%', '199 89% 48%', 'rank', false, NULL),
-- Achievement badges
('First Steps', 'Play your first game', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>', '280 87% 53%', '326 100% 74%', 'achievement', false, NULL),
('Veteran', 'Play 100 games', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><path d="M15 7A3 3 0 1 0 9 7"/><path d="M12 3a3 3 0 0 0-3 3v1h6V6a3 3 0 0 0-3-3z"/></svg>', '45 93% 47%', '16 100% 66%', 'achievement', false, NULL),
('Social Butterfly', 'Make 10 friends', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', '340 82% 52%', '291 64% 42%', 'achievement', false, NULL);

-- Trigger for ticket updates
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for profile assets (avatars and banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('profile-assets', 'profile-assets', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile assets
CREATE POLICY "Profile assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-assets');

-- Allow authenticated users to upload their own profile assets
CREATE POLICY "Users can upload their own profile assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile assets
CREATE POLICY "Users can update their own profile assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile assets
CREATE POLICY "Users can delete their own profile assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add banner_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banner_url text DEFAULT NULL;

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

-- Add last_seen_at to profiles for real-time presence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index for faster presence queries
CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx ON public.profiles(last_seen_at);

-- (Removed conflicting badge insert)

-- (Removed invalid policy on non-existent table)

-- 1. Chat Channels Table
CREATE TABLE public.chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add channel_id to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE;

-- 3. DM Threads (Groups or 1-on-1)
CREATE TABLE public.dm_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. DM Thread Participants
CREATE TABLE public.dm_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (thread_id, user_id)
);

-- 5. Direct Messages
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Profile Extensions (Presence & Status)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS status_type TEXT DEFAULT 'offline' CHECK (status_type IN ('online', 'idle', 'dnd', 'offline', 'gaming')),
ADD COLUMN IF NOT EXISTS last_presence_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 7. RLS Policies
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Channels: Anyone can read, admins can manage
CREATE POLICY "Anyone can view channels" ON public.chat_channels FOR SELECT USING (true);
CREATE POLICY "Admins can manage channels" ON public.chat_channels FOR ALL USING (has_role(auth.uid(), 'admin'));

-- DM Threads: Only participants can see their threads
CREATE POLICY "Participants can view own threads" ON public.dm_threads FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dm_participants WHERE thread_id = id AND user_id = auth.uid()));

-- DM Participants: Only participants can see who else is in the thread
CREATE POLICY "Participants can see other participants" ON public.dm_participants FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dm_participants p WHERE p.thread_id = thread_id AND p.user_id = auth.uid()));

-- Direct Messages: Only participants can read/send
CREATE POLICY "Participants can read messages" ON public.direct_messages FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dm_participants WHERE thread_id = thread_id AND user_id = auth.uid()));

CREATE POLICY "Participants can send messages" ON public.direct_messages FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.dm_participants WHERE thread_id = thread_id AND user_id = auth.uid()));

-- 8. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- 9. Seed some default channels
INSERT INTO public.chat_channels (name, slug, description, icon) VALUES
('General', 'general', 'General discussion about gaming and the site.', 'MessageCircle'),
('Updates', 'updates', 'Official site updates and news discussion.', 'Bell'),
('Support', 'support', 'Get help from the community and staff.', 'LifeBuoy'),
('Off-topic', 'off-topic', 'Talk about anything else here.', 'Coffee');

-- Add banner_url column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create a table for Gem AI assistant chat history
CREATE TABLE IF NOT EXISTS public.gem_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT, -- Optional classification from the bot
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gem_chat_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own gem chat history"
  ON public.gem_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gem chat history"
  ON public.gem_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS gem_chat_history_user_id_idx ON public.gem_chat_history (user_id);

-- Add social_links column to profiles table for storing Discord, Twitter, etc
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

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

-- Force schema cache reload and ensure columns exist
-- Run this in the Supabase SQL Editor

-- 1. Ensure columns exist (Idempotent)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title_color text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge_id text; -- Legacy check
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_badge_id uuid;

-- 2. Force PostgREST to reload the schema cache
-- This is critical to fix "could not find column ... in schema cache" errors
NOTIFY pgrst, 'reload schema';

