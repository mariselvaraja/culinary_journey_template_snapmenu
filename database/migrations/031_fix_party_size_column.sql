-- First check the current column type
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'party_size';

-- Ensure party_size is stored as an integer and not nullable
ALTER TABLE reservations 
ALTER COLUMN party_size TYPE integer USING party_size::integer,
ALTER COLUMN party_size SET NOT NULL;

-- Add check constraint to ensure party_size is positive
ALTER TABLE reservations 
ADD CONSTRAINT party_size_positive CHECK (party_size > 0);

-- Verify any existing data
SELECT id, customer_name, party_size, reservation_date, reservation_time
FROM reservations
ORDER BY reservation_date DESC, reservation_time DESC;
