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
