-- Drop existing policies for configurations
DROP POLICY IF EXISTS "Allow public read access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated write access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated update access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow public insert access to configurations" ON configurations;

-- Create new policies
CREATE POLICY "Allow public read access to configurations"
ON configurations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to configurations"
ON configurations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to configurations"
ON configurations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON configurations TO anon;
GRANT SELECT, INSERT, UPDATE ON configurations TO authenticated;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'configurations';
