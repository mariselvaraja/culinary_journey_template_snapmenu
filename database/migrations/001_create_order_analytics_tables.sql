-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
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

-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
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
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    calculation_period TSTZRANGE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON public.order_items(item_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type ON public.analytics_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON public.analytics_metrics USING GIST (calculation_period);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.order_items;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.analytics_metrics;
    DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON public.analytics_metrics;
END $$;

-- Create new policies
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_orders_updated_at ON public.orders;

-- Create updated_at trigger for orders table
CREATE TRIGGER handle_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_daily_metrics(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    date DATE,
    total_orders BIGINT,
    total_revenue DECIMAL(10,2),
    average_order_value DECIMAL(10,2)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(o.created_at) as date,
        COUNT(*) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as average_order_value
    FROM orders o
    WHERE DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(o.created_at)
    ORDER BY date;
END;
$$;

CREATE OR REPLACE FUNCTION get_item_performance(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    item_id TEXT,
    item_name TEXT,
    category TEXT,
    total_quantity BIGINT,
    total_revenue DECIMAL(10,2),
    order_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi.item_id,
        oi.item_name,
        oi.category,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY oi.item_id, oi.item_name, oi.category
    ORDER BY total_revenue DESC;
END;
$$;
