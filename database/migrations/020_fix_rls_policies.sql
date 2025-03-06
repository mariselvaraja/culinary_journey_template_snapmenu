-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated read access to analytics_metrics" ON analytics_metrics;
DROP POLICY IF EXISTS "Allow authenticated write access to analytics_metrics" ON analytics_metrics;
DROP POLICY IF EXISTS "Allow authenticated read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated write access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated write access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated read access to configurations" ON configurations;
DROP POLICY IF EXISTS "Allow authenticated write access to configurations" ON configurations;

-- Enable RLS on tables
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Analytics Metrics policies
CREATE POLICY "Allow authenticated read access to analytics_metrics"
ON analytics_metrics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated write access to analytics_metrics"
ON analytics_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow authenticated read access to orders"
ON orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated write access to orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to orders"
ON orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Order Items policies
CREATE POLICY "Allow authenticated read access to order_items"
ON order_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated write access to order_items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Configurations policies
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

-- Grant necessary permissions
GRANT SELECT, INSERT ON analytics_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON configurations TO authenticated;
GRANT SELECT ON configurations TO anon;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('analytics_metrics', 'orders', 'order_items', 'configurations');
