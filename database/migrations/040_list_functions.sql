-- List all functions related to reservations
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as argument_types,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE '%time_slot%' OR p.proname LIKE '%availability%');
