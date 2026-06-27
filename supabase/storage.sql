-- Create the client-docs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-docs', 'client-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-docs');

-- Policy to allow authenticated users to read files
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'client-docs');

-- Policy to allow authenticated users to delete files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-docs');
