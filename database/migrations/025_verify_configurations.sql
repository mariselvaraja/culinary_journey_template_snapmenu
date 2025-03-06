-- First, check if the configurations table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'configurations'
    ) THEN
        CREATE TABLE public.configurations (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Enable RLS on configurations table
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated write access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated update access to configurations" ON configurations;

-- Create RLS policies
CREATE POLICY "Allow public read access to configurations"
ON configurations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated write access to configurations"
ON configurations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to configurations"
ON configurations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON configurations TO anon;
GRANT SELECT, INSERT, UPDATE ON configurations TO authenticated;

-- Delete existing reservation configuration if it exists
DELETE FROM configurations WHERE key = 'reservation';

-- Insert default reservation configuration
INSERT INTO configurations (key, value)
VALUES (
    'reservation',
    jsonb_build_object(
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
);

-- Verify the configuration
SELECT * FROM configurations WHERE key = 'reservation';
