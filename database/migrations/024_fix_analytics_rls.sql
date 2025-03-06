-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated read access to analytics_metrics" ON analytics_metrics;
DROP POLICY IF EXISTS "Allow authenticated write access to analytics_metrics" ON analytics_metrics;

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_metrics
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

CREATE POLICY "Allow authenticated update access to analytics_metrics"
ON analytics_metrics
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON analytics_metrics TO authenticated;

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
AND tablename = 'analytics_metrics';

-- Insert sample analytics data if none exists
INSERT INTO analytics_metrics (
    metric_type,
    metric_name,
    metric_value,
    calculation_period
)
SELECT
    'daily_orders',
    'order_summary',
    jsonb_build_object(
        'total_orders', 0,
        'total_revenue', 0,
        'average_order_value', 0
    ),
    tstzrange(NOW(), NOW() + interval '1 day')
WHERE NOT EXISTS (
    SELECT 1 FROM analytics_metrics LIMIT 1
);
