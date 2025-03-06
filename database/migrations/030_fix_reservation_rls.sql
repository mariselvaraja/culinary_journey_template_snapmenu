-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON reservations;
DROP POLICY IF EXISTS "Enable insert for all users" ON reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON reservations;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON reservations FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON reservations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON reservations FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT ON reservations TO anon;
GRANT SELECT, INSERT, UPDATE ON reservations TO authenticated;

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
AND tablename = 'reservations';
