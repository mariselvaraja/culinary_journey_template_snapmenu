-- Drop existing function
DROP FUNCTION IF EXISTS check_table_availability;

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
    -- For now, just check if there's a reservation at that time
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_table_availability TO authenticated;
GRANT EXECUTE ON FUNCTION check_table_availability TO anon;

-- Test the function
SELECT * FROM check_table_availability(CURRENT_DATE, '18:00'::TIME, 2);
