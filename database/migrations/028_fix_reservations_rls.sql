BEGIN;

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temporarily disable RLS
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer_email ON reservations(email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
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
    EXECUTE FUNCTION handle_updated_at();

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
    ('Michael Brown', 'michael.b@email.com', '(555) 345-6789', CURRENT_DATE + INTERVAL '3 days', '20:00', 6, 'Birthday celebration', 'pending');

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON reservations;
DROP POLICY IF EXISTS "Enable insert for all users" ON reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON reservations;
DROP POLICY IF EXISTS "Enable public read access for own reservations" ON reservations;
DROP POLICY IF EXISTS "Enable public insert access" ON reservations;
DROP POLICY IF EXISTS "Enable authenticated update access" ON reservations;

-- Grant necessary permissions
GRANT SELECT, INSERT ON reservations TO anon;
GRANT SELECT, INSERT, UPDATE ON reservations TO authenticated;

-- Enable RLS and create policies
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access for own reservations" ON reservations
    FOR SELECT
    USING (true);

CREATE POLICY "Enable public insert access" ON reservations
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable authenticated update access" ON reservations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

COMMIT;
