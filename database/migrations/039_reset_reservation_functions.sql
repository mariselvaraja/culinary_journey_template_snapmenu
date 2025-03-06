-- Drop all versions of the functions
DROP FUNCTION IF EXISTS get_available_time_slots(DATE, INTEGER);
DROP FUNCTION IF EXISTS get_available_time_slots(check_date DATE, party_size INTEGER);
DROP FUNCTION IF EXISTS check_table_availability(DATE, TIME, INTEGER);
DROP FUNCTION IF EXISTS check_table_availability(check_date DATE, check_time TIME, party_size INTEGER);
DROP FUNCTION IF EXISTS check_table_availability(p_date DATE, p_time TIME, p_party_size INTEGER);

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION get_available_time_slots(
    check_date DATE,
    party_size INTEGER
)
RETURNS TABLE (
    slot_time TIME,
    available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH time_slots AS (
        -- Generate time slots from 11:30 AM to 9:30 PM
        SELECT (generate_series(
            '2024-01-01 11:30:00'::timestamp,
            '2024-01-01 21:30:00'::timestamp,
            '30 minutes'::interval
        ))::time as slot_time
    ),
    existing_reservations AS (
        -- Get existing reservations for the date
        SELECT reservation_time
        FROM reservations
        WHERE reservation_date = check_date
        AND status IN ('confirmed', 'pending')
    )
    SELECT 
        ts.slot_time,
        CASE 
            WHEN er.reservation_time IS NULL THEN true
            ELSE false
        END as available
    FROM time_slots ts
    LEFT JOIN existing_reservations er ON er.reservation_time = ts.slot_time
    ORDER BY ts.slot_time;
END;
$$;

-- Create function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
    check_date DATE,
    check_time TIME,
    party_size INTEGER
)
RETURNS TABLE (
    available BOOLEAN,
    message TEXT,
    table_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For now, just check if there's a reservation at that time
    IF EXISTS (
        SELECT 1
        FROM reservations
        WHERE reservation_date = check_date
        AND reservation_time = check_time
        AND status IN ('confirmed', 'pending')
    ) THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'This time slot is already booked'::TEXT,
            NULL::UUID;
    ELSE
        RETURN QUERY SELECT 
            true::BOOLEAN,
            'Time slot available'::TEXT,
            uuid_generate_v4()::UUID;
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_available_time_slots(DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_time_slots(DATE, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION check_table_availability(DATE, TIME, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_table_availability(DATE, TIME, INTEGER) TO anon;
