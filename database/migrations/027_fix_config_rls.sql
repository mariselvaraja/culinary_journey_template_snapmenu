BEGIN;

-- Drop existing objects
DROP SCHEMA IF EXISTS public_api CASCADE;
DROP FUNCTION IF EXISTS get_reservation_config CASCADE;
DROP FUNCTION IF EXISTS get_time_slots CASCADE;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS configurations (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_id UUID,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON reservations(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS handle_configurations_updated_at ON configurations;
CREATE TRIGGER handle_configurations_updated_at
    BEFORE UPDATE ON configurations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_reservations_updated_at ON reservations;
CREATE TRIGGER handle_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create function to get reservation config
CREATE OR REPLACE FUNCTION get_reservation_config()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT value
        FROM configurations
        WHERE key = 'reservation'
    );
END;
$$;

-- Create function to get time slots
CREATE OR REPLACE FUNCTION get_time_slots(p_date DATE)
RETURNS TABLE (
    reservation_date DATE,
    reservation_time TIME,
    bookings BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.reservation_date,
        r.reservation_time,
        COUNT(*) as bookings
    FROM reservations r
    WHERE r.reservation_date = p_date
    AND r.status IN ('confirmed', 'pending')
    GROUP BY r.reservation_date, r.reservation_time;
END;
$$;

-- Insert default reservation configuration if it doesn't exist
INSERT INTO configurations (key, value)
SELECT 'reservation', jsonb_build_object(
    'timeSlotInterval', 30,
    'maxPartySize', 12,
    'minPartySize', 1,
    'maxAdvanceDays', 30,
    'minNoticeHours', 2,
    'reservationHoldTime', 15,
    'allowSameDay', true,
    'requirePhone', true,
    'requireEmail', true,
    'maxSpecialRequestLength', 500,
    'holidays', jsonb_build_array(),
    'operatingHours', jsonb_build_object(
        'monday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'tuesday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'wednesday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'thursday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'friday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '23:00')
            )
        ),
        'saturday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '23:00')
            )
        ),
        'sunday', jsonb_build_object(
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        )
    )
)
WHERE NOT EXISTS (
    SELECT 1 FROM configurations WHERE key = 'reservation'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_reservation_config() TO anon;
GRANT EXECUTE ON FUNCTION get_time_slots(DATE) TO anon;
GRANT INSERT ON reservations TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Disable RLS
ALTER TABLE configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

COMMIT;
