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