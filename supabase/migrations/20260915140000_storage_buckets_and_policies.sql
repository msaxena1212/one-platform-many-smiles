-- =============================================================================
-- Migration: 20260915140000_storage_buckets_and_policies.sql
-- Description: Create Supabase Storage buckets and security policies
-- =============================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('lease-documents', 'lease-documents', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('tenant-ids', 'tenant-ids', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('receipts', 'receipts', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing storage policies
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access lease documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage lease documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access tenant IDs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage tenant IDs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage receipts" ON storage.objects;

-- 3. Define Storage Policies

-- property-images: Public View, Authenticated Upload/Update/Delete
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can manage property images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- lease-documents: Authenticated Read & Write
CREATE POLICY "Authenticated users can access lease documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lease-documents');

CREATE POLICY "Authenticated users can manage lease documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'lease-documents')
WITH CHECK (bucket_id = 'lease-documents');

-- tenant-ids: Authenticated Read & Write
CREATE POLICY "Authenticated users can access tenant IDs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tenant-ids');

CREATE POLICY "Authenticated users can manage tenant IDs"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'tenant-ids')
WITH CHECK (bucket_id = 'tenant-ids');

-- receipts: Authenticated Read & Write
CREATE POLICY "Authenticated users can access receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can manage receipts"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');
