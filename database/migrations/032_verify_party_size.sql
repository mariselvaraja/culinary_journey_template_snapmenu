-- First, let's check the current data types and any potential issues
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'party_size';

-- Check for any non-numeric values in party_size
SELECT id, customer_name, party_size, reservation_date, reservation_time
FROM reservations
WHERE party_size::text !~ '^[0-9]+$'
ORDER BY reservation_date DESC;

-- Check for any unexpected values (like 0 or negative numbers)
SELECT id, customer_name, party_size, reservation_date, reservation_time
FROM reservations
WHERE party_size <= 0
ORDER BY reservation_date DESC;

-- Add constraint to ensure party_size is positive
ALTER TABLE reservations 
DROP CONSTRAINT IF EXISTS party_size_positive;

ALTER TABLE reservations 
ADD CONSTRAINT party_size_positive CHECK (party_size > 0);

-- Update any existing rows where party_size might be 0 or null
UPDATE reservations 
SET party_size = 2
WHERE party_size <= 0 OR party_size IS NULL;

-- Verify the data after fixes
SELECT id, customer_name, party_size, reservation_date, reservation_time, status
FROM reservations
ORDER BY reservation_date DESC, reservation_time DESC;
