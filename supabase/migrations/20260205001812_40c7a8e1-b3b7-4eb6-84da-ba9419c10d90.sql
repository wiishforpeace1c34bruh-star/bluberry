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