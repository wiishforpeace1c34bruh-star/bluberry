-- FORCE FIX: Relax Security to Allow Sign Up
-- This removes the strict check that requires you to be logged in to create a profile.
-- Run this in Supabase SQL Editor.

-- 1. Drop existing strict policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow Profile Creation" ON public.profiles;

-- 2. Create a permissive policy
-- This allows the app to create the profile even if Email Confirmation is ON
CREATE POLICY "Allow Profile Creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 3. Ensure everyone can see profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);
