-- Create meal_photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal_photos', 'meal_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create gift_photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift_photos', 'gift_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for meal_photos bucket
CREATE POLICY "Authenticated users can upload meal photos"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'meal_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view meal photos"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'meal_photos');

-- Create policies for gift_photos bucket
CREATE POLICY "Authenticated users can upload gift photos"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'gift_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view gift photos"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'gift_photos');