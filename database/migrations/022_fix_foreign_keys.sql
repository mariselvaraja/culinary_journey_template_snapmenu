-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.analytics_metrics;

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('takeout', 'delivery')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    pickup_time TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    device_type TEXT,
    user_agent TEXT,
    ip_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table with proper foreign key
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics metrics table
CREATE TABLE public.analytics_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    calculation_period TSTZRANGE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_item_id ON public.order_items(item_id);
CREATE INDEX idx_analytics_metrics_type ON public.analytics_metrics(metric_type);
CREATE INDEX idx_analytics_metrics_period ON public.analytics_metrics USING GIST (calculation_period);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON public.order_items
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.analytics_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert/update for authenticated users" ON public.analytics_metrics
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders table
DROP TRIGGER IF EXISTS handle_orders_updated_at ON orders;
CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample orders
INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    order_type,
    status,
    pickup_time,
    total_amount,
    payment_method,
    device_type,
    user_agent,
    created_at
)
VALUES
    ('John Smith', 'john.smith@email.com', '(555) 123-4567', 'takeout', 'completed', NOW() - INTERVAL '2 hours', 156.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW() - INTERVAL '2 hours'),
    ('Emma Wilson', 'emma.w@email.com', '(555) 234-5678', 'takeout', 'completed', NOW() - INTERVAL '1 day', 98.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
    ('Michael Brown', 'michael.b@email.com', '(555) 345-6789', 'takeout', 'pending', NOW() + INTERVAL '2 hours', 224.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW());

-- Insert sample order items
WITH order_data AS (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 3
)
INSERT INTO order_items (
    order_id,
    item_id,
    item_name,
    category,
    quantity,
    unit_price,
    total_price,
    customizations
)
SELECT
    o.id,
    'item-' || ROW_NUMBER() OVER () as item_id,
    'Menu Item ' || ROW_NUMBER() OVER () as item_name,
    CASE MOD(ROW_NUMBER() OVER (), 3)
        WHEN 0 THEN 'appetizer'
        WHEN 1 THEN 'main'
        ELSE 'dessert'
    END as category,
    FLOOR(RANDOM() * 3 + 1)::int as quantity,
    (FLOOR((RANDOM() * 20 + 10) * 100) / 100)::decimal(10,2) as unit_price,
    (FLOOR((RANDOM() * 20 + 10) * FLOOR(RANDOM() * 3 + 1) * 100) / 100)::decimal(10,2) as total_price,
    NULL as customizations
FROM order_data o
CROSS JOIN generate_series(1, 3);

-- Insert sample analytics metrics
INSERT INTO analytics_metrics (
    metric_type,
    metric_name,
    metric_value,
    calculation_period
)
SELECT
    'daily_orders' as metric_type,
    'order_summary' as metric_name,
    jsonb_build_object(
        'total_orders', COUNT(*),
        'total_revenue', SUM(total_amount),
        'average_order_value', (FLOOR(AVG(total_amount) * 100) / 100)::decimal(10,2)
    ) as metric_value,
    tstzrange(
        date_trunc('day', created_at),
        date_trunc('day', created_at) + interval '1 day'
    ) as calculation_period
FROM orders
GROUP BY date_trunc('day', created_at);
