-- Add social_links column to profiles table for storing Discord, Twitter, etc
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
