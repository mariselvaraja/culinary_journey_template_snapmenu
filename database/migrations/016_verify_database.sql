-- Check if tables exist
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'configurations'
) as configurations_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tables'
) as tables_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reservations'
) as reservations_exists;

-- Check if functions exist
SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'get_available_time_slots'
) as get_available_time_slots_exists;

SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'check_table_availability'
) as check_table_availability_exists;

-- Check configuration data
SELECT * FROM configurations WHERE key = 'reservation';

-- Check if there are any tables defined
SELECT * FROM tables;

-- Check function definitions
\df get_available_time_slots
\df check_table_availability

-- Check table columns
\d configurations
\d tables
\d reservations

-- Check if there are any existing reservations
SELECT COUNT(*) as reservation_count FROM reservations;

-- Check if RLS policies are enabled
SELECT tablename, hasindexes, hasrules, hastriggers, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('configurations', 'tables', 'reservations');

-- Check function permissions
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as args,
    CASE WHEN has_function_privilege('authenticated', p.oid, 'execute') 
         THEN 'YES' ELSE 'NO' 
    END as authenticated_can_execute
FROM pg_proc p 
WHERE p.proname IN ('get_available_time_slots', 'check_table_availability');

-- Check if any errors in recent function calls
SELECT * FROM pg_stat_activity 
WHERE query LIKE '%get_available_time_slots%' 
OR query LIKE '%check_table_availability%'
ORDER BY query_start DESC 
LIMIT 5;
