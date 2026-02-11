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
