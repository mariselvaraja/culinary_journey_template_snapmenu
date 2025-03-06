-- Drop existing function
DROP FUNCTION IF EXISTS get_available_time_slots;

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_date DATE,
    p_party_size INTEGER
)
RETURNS TABLE (
    time TIME,
    available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH time_slots AS (
        -- Generate time slots from 11:30 AM to 9:30 PM
        SELECT time_slot::time as time
        FROM generate_series(
            '11:30'::time,
            '21:30'::time,
            '30 minutes'::interval
        ) time_slot
    ),
    existing_reservations AS (
        -- Get existing reservations for the date
        SELECT reservation_time
        FROM reservations
        WHERE reservation_date = p_date
        AND status IN ('confirmed', 'pending')
    )
    SELECT 
        ts.time,
        CASE 
            WHEN er.reservation_time IS NULL THEN true
            ELSE false
        END as available
    FROM time_slots ts
    LEFT JOIN existing_reservations er ON er.reservation_time = ts.time
    ORDER BY ts.time;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_time_slots TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_time_slots TO anon;

-- Test the function
SELECT * FROM get_available_time_slots(CURRENT_DATE, 2);
