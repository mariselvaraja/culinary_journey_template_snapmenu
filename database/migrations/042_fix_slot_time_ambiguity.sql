-- Drop existing functions
DROP FUNCTION IF EXISTS get_available_time_slots(DATE, INTEGER);
DROP FUNCTION IF EXISTS check_table_availability(DATE, TIME, INTEGER);

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_date DATE,
    p_party_size INTEGER
)
RETURNS TABLE (
    slot_time TIME,
    available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIME := '11:30:00'::TIME;
    v_end_time TIME := '21:30:00'::TIME;
    v_interval INTERVAL := '30 minutes'::INTERVAL;
BEGIN
    -- Input validation
    IF p_date IS NULL THEN
        RAISE EXCEPTION 'Date parameter cannot be null';
    END IF;

    IF p_party_size IS NULL OR p_party_size <= 0 THEN
        RAISE EXCEPTION 'Party size must be greater than 0';
    END IF;

    RETURN QUERY
    WITH RECURSIVE time_slots(slot_time) AS (
        -- Start with the first time slot
        SELECT v_start_time
        UNION ALL
        -- Generate subsequent time slots
        SELECT (t.slot_time + v_interval)::TIME
        FROM time_slots t
        WHERE t.slot_time + v_interval <= v_end_time
    ),
    existing_reservations AS (
        -- Get existing reservations for the date
        SELECT reservation_time
        FROM reservations
        WHERE reservation_date = p_date
        AND status IN ('confirmed', 'pending')
    )
    SELECT 
        t.slot_time,
        CASE 
            WHEN er.reservation_time IS NULL THEN true
            ELSE false
        END as available
    FROM time_slots t
    LEFT JOIN existing_reservations er ON er.reservation_time = t.slot_time
    ORDER BY t.slot_time;
END;
$$;

-- Create function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
    p_date DATE,
    p_time TIME,
    p_party_size INTEGER
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
    -- Input validation
    IF p_date IS NULL THEN
        RAISE EXCEPTION 'Date parameter cannot be null';
    END IF;

    IF p_time IS NULL THEN
        RAISE EXCEPTION 'Time parameter cannot be null';
    END IF;

    IF p_party_size IS NULL OR p_party_size <= 0 THEN
        RAISE EXCEPTION 'Party size must be greater than 0';
    END IF;

    -- Check if the time is within operating hours
    IF p_time < '11:30:00'::TIME OR p_time > '21:30:00'::TIME THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'Selected time is outside operating hours (11:30 AM - 9:30 PM)'::TEXT,
            NULL::UUID;
        RETURN;
    END IF;

    -- Check if there's a reservation at that time
    IF EXISTS (
        SELECT 1
        FROM reservations
        WHERE reservation_date = p_date
        AND reservation_time = p_time
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
