-- Create tables table if it doesn't exist
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    section TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to reservations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_table'
    ) THEN
        ALTER TABLE reservations
        ADD CONSTRAINT fk_table
        FOREIGN KEY (table_id)
        REFERENCES tables(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Insert sample tables if they don't exist
INSERT INTO tables (number, capacity, section, status)
SELECT t.number, t.capacity, t.section, 'active'
FROM (
    VALUES 
        (1, 2, 'Main'),
        (2, 4, 'Main'),
        (3, 4, 'Main'),
        (4, 6, 'Main'),
        (5, 8, 'Main')
) AS t (number, capacity, section)
WHERE NOT EXISTS (SELECT 1 FROM tables LIMIT 1);

-- Create or replace the functions
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
DECLARE
    v_table_id UUID;
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

    -- Find an available table that can accommodate the party size
    SELECT id INTO v_table_id
    FROM tables
    WHERE capacity >= p_party_size
    AND status = 'active'
    AND NOT EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.table_id = tables.id
        AND r.reservation_date = p_date
        AND r.reservation_time = p_time
        AND r.status IN ('confirmed', 'pending')
    )
    ORDER BY capacity ASC
    LIMIT 1;

    IF v_table_id IS NULL THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'No tables available for this party size'::TEXT,
            NULL::UUID;
    ELSE
        RETURN QUERY SELECT 
            true::BOOLEAN,
            'Table available'::TEXT,
            v_table_id;
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_available_time_slots(DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_time_slots(DATE, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION check_table_availability(DATE, TIME, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_table_availability(DATE, TIME, INTEGER) TO anon;
