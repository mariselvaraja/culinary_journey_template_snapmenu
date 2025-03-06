-- Enable RLS on tables
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated read access to tables" ON tables;
DROP POLICY IF EXISTS "Allow authenticated read access to reservations" ON reservations;

-- Create policies for configurations
CREATE POLICY "Allow public read access to configurations"
ON configurations
FOR SELECT
TO public
USING (true);

-- Create policies for tables
CREATE POLICY "Allow authenticated read access to tables"
ON tables
FOR SELECT
TO authenticated
USING (true);

-- Create policies for reservations
CREATE POLICY "Allow authenticated read access to reservations"
ON reservations
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON configurations TO anon, authenticated;
GRANT SELECT ON tables TO authenticated;
GRANT SELECT ON reservations TO authenticated;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('configurations', 'tables', 'reservations');

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
AND tablename IN ('configurations', 'tables', 'reservations');

-- Verify function permissions
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as args,
    CASE WHEN has_function_privilege('anon', p.oid, 'execute') 
         THEN 'YES' ELSE 'NO' 
    END as anon_can_execute,
    CASE WHEN has_function_privilege('authenticated', p.oid, 'execute') 
         THEN 'YES' ELSE 'NO' 
    END as authenticated_can_execute
FROM pg_proc p 
WHERE p.proname IN ('get_available_time_slots', 'check_table_availability');

-- Test access
SET ROLE anon;
SELECT * FROM configurations WHERE key = 'reservation';
RESET ROLE;

SET ROLE authenticated;
SELECT * FROM configurations WHERE key = 'reservation';
SELECT * FROM tables LIMIT 1;
SELECT * FROM get_available_time_slots(CURRENT_DATE, 2);
RESET ROLE;
