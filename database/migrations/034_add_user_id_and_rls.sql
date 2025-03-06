-- Step 1: Add user_id column to reservations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE reservations
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);

-- Step 2: Set up RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Tables are viewable by authenticated users" ON tables;
DROP POLICY IF EXISTS "Tables are viewable by public" ON tables;
DROP POLICY IF EXISTS "Tables are editable by admin" ON tables;
DROP POLICY IF EXISTS "Reservations are viewable by owner" ON reservations;
DROP POLICY IF EXISTS "Reservations are viewable by admin" ON reservations;
DROP POLICY IF EXISTS "Reservations are editable by admin" ON reservations;
DROP POLICY IF EXISTS "Reservations are insertable by anyone" ON reservations;

-- Enable RLS on tables
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Create policies for tables
CREATE POLICY "Tables are viewable by authenticated users"
ON tables
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tables are viewable by public"
ON tables
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Tables are editable by admin"
ON tables
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.uid()::uuid = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create policies for reservations
CREATE POLICY "Reservations are viewable by owner"
ON reservations
FOR SELECT
TO authenticated
USING (
  (user_id IS NULL) -- Allow viewing anonymous reservations
  OR auth.uid()::uuid = user_id
  OR EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.uid()::uuid = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Reservations are viewable by admin"
ON reservations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.uid()::uuid = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Reservations are editable by admin"
ON reservations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.uid()::uuid = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Reservations are insertable by anyone"
ON reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Enable RLS on reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations';

-- Verify RLS is working
SELECT * FROM pg_policies WHERE schemaname = 'public';
