-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name)
VALUES 
  ('event_photos', 'Event Photos'),
  ('event_covers', 'Event Cover Images')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Users can upload event photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event photos" ON storage.objects;

CREATE POLICY "Users can upload event photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event_photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload event covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event_covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view event photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id IN ('event_photos', 'event_covers'));

-- Create trigger to automatically create user record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();