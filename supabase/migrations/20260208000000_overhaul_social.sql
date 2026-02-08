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
