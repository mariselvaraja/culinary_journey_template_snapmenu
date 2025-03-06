-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Create configurations table
CREATE TABLE IF NOT EXISTS configurations (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create tables table
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID REFERENCES tables(id),
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    waitlist_date DATE NOT NULL,
    waitlist_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    order_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create order_analytics table
CREATE TABLE IF NOT EXISTS order_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_date DATE NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    average_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    peak_hours JSONB,
    popular_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Create business_metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 10: Create health_scores table
CREATE TABLE IF NOT EXISTS health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    score_date DATE NOT NULL,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 11: Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_date DATE NOT NULL,
    category TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    impact_score INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 12: Add triggers
DO $$ BEGIN
    CREATE TRIGGER update_configurations_updated_at
        BEFORE UPDATE ON configurations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_tables_updated_at
        BEFORE UPDATE ON tables
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_reservations_updated_at
        BEFORE UPDATE ON reservations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_waitlist_updated_at
        BEFORE UPDATE ON waitlist
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_order_analytics_updated_at
        BEFORE UPDATE ON order_analytics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_business_metrics_updated_at
        BEFORE UPDATE ON business_metrics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_health_scores_updated_at
        BEFORE UPDATE ON health_scores
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_recommendations_updated_at
        BEFORE UPDATE ON recommendations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN others THEN null;
END $$;

-- Step 13: Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_reservations_date_time;
DROP INDEX IF EXISTS idx_waitlist_date_time;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_analytics_date;
DROP INDEX IF EXISTS idx_business_metrics_date_type;
DROP INDEX IF EXISTS idx_health_scores_date_category;
DROP INDEX IF EXISTS idx_recommendations_date_category;

-- Step 14: Create new indexes
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_waitlist_date_time ON waitlist(waitlist_date, waitlist_time);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_analytics_date ON order_analytics(analytics_date);
CREATE INDEX idx_business_metrics_date_type ON business_metrics(metric_date, metric_type);
CREATE INDEX idx_health_scores_date_category ON health_scores(score_date, category);
CREATE INDEX idx_recommendations_date_category ON recommendations(recommendation_date, category);
