-- Drop existing functions
DROP FUNCTION IF EXISTS get_available_time_slots(DATE, INTEGER);
DROP FUNCTION IF EXISTS check_table_availability(DATE, TIME, INTEGER);

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.reservations;

-- Create reservations table
CREATE TABLE public.reservations (
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
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_customer_email ON public.reservations(email);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.reservations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.reservations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.reservations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reservations table
DROP TRIGGER IF EXISTS handle_reservations_updated_at ON reservations;
CREATE TRIGGER handle_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample reservations
INSERT INTO reservations (
    customer_name,
    email,
    phone,
    reservation_date,
    reservation_time,
    party_size,
    special_requests,
    status
)
VALUES
    ('John Smith', 'john.smith@email.com', '(555) 123-4567', CURRENT_DATE + INTERVAL '1 day', '18:30', 4, 'Window seat preferred', 'confirmed'),
    ('Emma Wilson', 'emma.w@email.com', '(555) 234-5678', CURRENT_DATE + INTERVAL '2 days', '19:00', 2, 'Anniversary celebration', 'confirmed'),
    ('Michael Brown', 'michael.b@email.com', '(555) 345-6789', CURRENT_DATE + INTERVAL '3 days', '20:00', 6, 'Birthday celebration', 'pending'),
    ('Sarah Johnson', 'sarah.j@email.com', '(555) 456-7890', CURRENT_DATE + INTERVAL '4 days', '17:30', 3, NULL, 'confirmed'),
    ('David Lee', 'david.l@email.com', '(555) 567-8901', CURRENT_DATE + INTERVAL '5 days', '19:30', 5, 'Allergic to nuts', 'pending'),
    ('Lisa Anderson', 'lisa.a@email.com', '(555) 678-9012', CURRENT_DATE - INTERVAL '1 day', '18:00', 2, NULL, 'completed'),
    ('James Wilson', 'james.w@email.com', '(555) 789-0123', CURRENT_DATE - INTERVAL '2 days', '19:00', 4, 'Vegetarian options needed', 'completed'),
    ('Emily Davis', 'emily.d@email.com', '(555) 890-1234', CURRENT_DATE + INTERVAL '6 days', '20:30', 8, 'Business dinner', 'confirmed'),
    ('Robert Taylor', 'robert.t@email.com', '(555) 901-2345', CURRENT_DATE + INTERVAL '7 days', '18:30', 2, NULL, 'pending'),
    ('Jennifer White', 'jennifer.w@email.com', '(555) 012-3456', CURRENT_DATE + INTERVAL '8 days', '19:00', 6, 'Celebrating graduation', 'confirmed');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON reservations TO authenticated;
GRANT SELECT, INSERT ON reservations TO anon;

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION get_available_time_slots(
    check_date DATE,
    party_size INTEGER
)
RETURNS TABLE (
    time_slot TIME,
    available BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH time_slots AS (
        SELECT time_slot::time
        FROM generate_series(
            '11:30'::time,
            '21:30'::time,
            '30 minutes'::interval
        ) time_slot
    ),
    existing_reservations AS (
        SELECT reservation_time, party_size
        FROM reservations
        WHERE reservation_date = check_date
        AND status IN ('confirmed', 'pending')
    )
    SELECT 
        ts.time_slot,
        COALESCE(
            NOT EXISTS (
                SELECT 1
                FROM existing_reservations er
                WHERE er.reservation_time = ts.time_slot
            ),
            true
        ) as available
    FROM time_slots ts
    ORDER BY ts.time_slot;
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

-- Verify the data
SELECT * FROM reservations ORDER BY reservation_date, reservation_time;
