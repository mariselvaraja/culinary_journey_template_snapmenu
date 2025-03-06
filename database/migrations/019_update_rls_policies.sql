-- Add update policy for configurations
DROP POLICY IF EXISTS "Allow authenticated update access to configurations" ON configurations;

CREATE POLICY "Allow authenticated update access to configurations"
ON configurations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant update permission
GRANT UPDATE ON configurations TO authenticated;

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
