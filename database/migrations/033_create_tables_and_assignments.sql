-- Drop existing functions first
DROP FUNCTION IF EXISTS check_table_availability(DATE, TIME, INTEGER);
DROP FUNCTION IF EXISTS find_available_table(DATE, TIME, INTEGER);

-- First, remove the table_id foreign key if it exists
ALTER TABLE IF EXISTS reservations
DROP CONSTRAINT IF EXISTS fk_table;

-- Drop the tables table if it exists
DROP TABLE IF EXISTS public.tables CASCADE;

-- Create tables table
CREATE TABLE public.tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('Window', 'Main', 'Private')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint to ensure positive capacity
ALTER TABLE tables 
ADD CONSTRAINT table_capacity_positive CHECK (capacity > 0);

-- Create index on number for quick lookups
CREATE INDEX idx_tables_number ON tables(number);

-- First, clear any existing table_id values in reservations
UPDATE reservations SET table_id = NULL;

-- Now add the foreign key constraint
ALTER TABLE reservations
ADD CONSTRAINT fk_table
FOREIGN KEY (table_id)
REFERENCES tables(id)
ON DELETE SET NULL;

-- Create function to find available tables
CREATE OR REPLACE FUNCTION find_available_table(
    check_date DATE,
    check_time TIME,
    party_size INTEGER
)
RETURNS TABLE (
    table_id UUID,
    number INTEGER,
    capacity INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.number,
        t.capacity
    FROM tables t
    WHERE t.status = 'active'
    AND t.capacity >= party_size
    AND NOT EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.table_id = t.id
        AND r.reservation_date = check_date
        AND r.reservation_time = check_time
        AND r.status IN ('confirmed', 'pending')
    )
    ORDER BY t.capacity ASC
    LIMIT 1;
END;
$$;

-- Create function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
    check_date DATE,
    check_time TIME,
    required_capacity INTEGER
)
RETURNS TABLE (
    available BOOLEAN,
    message TEXT,
    table_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    found_table_id UUID;
    found_table_number INTEGER;
BEGIN
    -- Try to find an available table
    SELECT t.id, t.number
    INTO found_table_id, found_table_number
    FROM find_available_table(check_date, check_time, required_capacity) t
    LIMIT 1;

    IF found_table_id IS NOT NULL THEN
        RETURN QUERY SELECT 
            true::BOOLEAN,
            format('Table %s is available', found_table_number)::TEXT,
            found_table_id::UUID;
    ELSE
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'No tables available for this party size at the selected time'::TEXT,
            NULL::UUID;
    END IF;
END;
$$;

-- Insert sample tables
INSERT INTO tables (number, capacity, section) VALUES
    (1, 2, 'Window'),
    (2, 2, 'Window'),
    (3, 4, 'Window'),
    (4, 4, 'Main'),
    (5, 4, 'Main'),
    (6, 6, 'Main'),
    (7, 6, 'Main'),
    (8, 8, 'Private'),
    (9, 8, 'Private'),
    (10, 10, 'Private')
ON CONFLICT (number) DO NOTHING;

-- Update existing reservations to assign tables where possible
WITH reservation_assignments AS (
    SELECT 
        r.id as reservation_id,
        t.id as table_id
    FROM reservations r
    CROSS JOIN LATERAL (
        SELECT t.id
        FROM tables t
        WHERE t.capacity >= r.party_size
        AND t.status = 'active'
        AND NOT EXISTS (
            SELECT 1
            FROM reservations r2
            WHERE r2.table_id = t.id
            AND r2.reservation_date = r.reservation_date
            AND r2.reservation_time = r.reservation_time
            AND r2.status IN ('confirmed', 'pending')
            AND r2.id != r.id
        )
        ORDER BY t.capacity ASC
        LIMIT 1
    ) t
    WHERE r.status IN ('confirmed', 'pending')
)
UPDATE reservations r
SET table_id = ra.table_id
FROM reservation_assignments ra
WHERE r.id = ra.reservation_id;

-- Verify the setup
SELECT 
    t.number,
    t.capacity,
    t.section,
    COUNT(r.id) as current_reservations
FROM tables t
LEFT JOIN reservations r ON r.table_id = t.id
AND r.status IN ('confirmed', 'pending')
AND r.reservation_date >= CURRENT_DATE
GROUP BY t.id, t.number, t.capacity, t.section
ORDER BY t.number;

-- Show reservations with their assigned tables
SELECT 
    r.id,
    r.customer_name,
    r.party_size,
    r.reservation_date,
    r.reservation_time,
    r.status,
    t.number,
    t.capacity
FROM reservations r
LEFT JOIN tables t ON r.table_id = t.id
WHERE r.reservation_date >= CURRENT_DATE
ORDER BY r.reservation_date, r.reservation_time;
