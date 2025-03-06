-- First, insert the reservation configuration
INSERT INTO public.configurations (key, value)
VALUES (
    'reservation_settings',
    jsonb_build_object(
        'timeSlots', jsonb_build_array(
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
        ),
        'maxPartySize', 12,
        'minPartySize', 1,
        'advanceBookingDays', 30,
        'defaultDuration', 120,
        'specialDates', jsonb_build_object(
            'holidays', jsonb_build_array(
                jsonb_build_object(
                    'date', '2024-12-25',
                    'name', 'Christmas Day',
                    'closed', true
                ),
                jsonb_build_object(
                    'date', '2024-12-31',
                    'name', 'New Year''s Eve',
                    'specialHours', jsonb_build_array('17:00', '17:30', '18:00', '18:30', '19:00', '19:30')
                )
            ),
            'closedDays', jsonb_build_array('Monday')
        ),
        'tables', jsonb_build_array(
            jsonb_build_object('number', 1, 'capacity', 2, 'isActive', true),
            jsonb_build_object('number', 2, 'capacity', 2, 'isActive', true),
            jsonb_build_object('number', 3, 'capacity', 4, 'isActive', true),
            jsonb_build_object('number', 4, 'capacity', 4, 'isActive', true),
            jsonb_build_object('number', 5, 'capacity', 6, 'isActive', true),
            jsonb_build_object('number', 6, 'capacity', 6, 'isActive', true),
            jsonb_build_object('number', 7, 'capacity', 8, 'isActive', true),
            jsonb_build_object('number', 8, 'capacity', 8, 'isActive', true),
            jsonb_build_object('number', 9, 'capacity', 10, 'isActive', true),
            jsonb_build_object('number', 10, 'capacity', 12, 'isActive', true)
        )
    )
);

-- Insert sample orders spanning the last 30 days
INSERT INTO public.orders (
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
) VALUES
    ('John Smith', 'john.smith@email.com', '(555) 123-4567', 'takeout', 'completed', NOW() - INTERVAL '2 hours', 156.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW() - INTERVAL '2 hours'),
    ('Emma Wilson', 'emma.w@email.com', '(555) 234-5678', 'takeout', 'completed', NOW() - INTERVAL '1 day', 98.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
    ('Michael Brown', 'michael.b@email.com', '(555) 345-6789', 'takeout', 'pending', NOW() + INTERVAL '2 hours', 224.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW()),
    ('Sarah Davis', 'sarah.d@email.com', '(555) 456-7890', 'takeout', 'confirmed', NOW() + INTERVAL '1 hour', 144.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '30 minutes'),
    ('James Johnson', 'james.j@email.com', '(555) 567-8901', 'takeout', 'cancelled', NOW() - INTERVAL '3 days', 182.00, 'credit_card', 'tablet', 'Mozilla/5.0', NOW() - INTERVAL '3 days'),
    ('Lisa Anderson', 'lisa.a@email.com', '(555) 678-9012', 'takeout', 'completed', NOW() - INTERVAL '5 days', 136.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW() - INTERVAL '5 days'),
    ('Robert Martin', 'robert.m@email.com', '(555) 789-0123', 'takeout', 'completed', NOW() - INTERVAL '7 days', 198.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '7 days'),
    ('Emily White', 'emily.w@email.com', '(555) 890-1234', 'takeout', 'completed', NOW() - INTERVAL '10 days', 164.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW() - INTERVAL '10 days'),
    ('David Clark', 'david.c@email.com', '(555) 901-2345', 'takeout', 'completed', NOW() - INTERVAL '15 days', 246.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '15 days'),
    ('Jennifer Lee', 'jennifer.l@email.com', '(555) 012-3456', 'takeout', 'completed', NOW() - INTERVAL '20 days', 178.00, 'credit_card', 'tablet', 'Mozilla/5.0', NOW() - INTERVAL '20 days');

-- Insert order items for each order
WITH order_ids AS (SELECT id FROM public.orders ORDER BY created_at DESC LIMIT 10)
INSERT INTO public.order_items (
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
    o.id as order_id,
    item.id,
    item.name,
    item.category,
    quantity,
    price::numeric,
    (price::numeric * quantity) as total_price,
    CASE 
        WHEN item.customizations IS NULL THEN NULL::jsonb
        ELSE item.customizations::jsonb
    END as customizations
FROM order_ids o
CROSS JOIN LATERAL (
    VALUES 
        ('french-onion-soup', 'French Onion Soup', 'starters', 1, '14', NULL),
        ('wagyu-ribeye1', 'Wagyu Ribeye', 'mains', 1, '120', '{"notes": "medium rare"}'),
        ('creme-brulee', 'Crème Brûlée', 'desserts', 2, '14', NULL)
) AS item(id, name, category, quantity, price, customizations)
WHERE random() > 0.3;

-- Insert some additional individual items for variety
INSERT INTO public.order_items (
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
    o.id as order_id,
    'sea-bass' as item_id,
    'Pan-Seared Sea Bass' as item_name,
    'mains' as category,
    1 as quantity,
    42 as unit_price,
    42 as total_price,
    NULL::jsonb as customizations
FROM public.orders o
WHERE random() > 0.7
LIMIT 3;

INSERT INTO public.order_items (
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
    o.id as order_id,
    'truffle-risotto' as item_id,
    'Black Truffle Risotto' as item_name,
    'mains' as category,
    1 as quantity,
    38 as unit_price,
    38 as total_price,
    NULL::jsonb as customizations
FROM public.orders o
WHERE random() > 0.7
LIMIT 2;

-- Insert sample reservations
INSERT INTO public.reservations (
    table_id,
    customer_name,
    email,
    phone,
    date,
    time,
    party_size,
    status,
    notes,
    created_at
)
SELECT
    t.id as table_id,
    name,
    email,
    phone,
    reservation_date,
    reservation_time,
    party_size,
    status,
    notes,
    created_at
FROM (
    VALUES
        ('Alice Johnson', 'alice.j@email.com', '(555) 111-2233', CURRENT_DATE + 1, '18:00'::time, 2, 'confirmed', 'Anniversary dinner', NOW() - INTERVAL '2 days'),
        ('Bob Wilson', 'bob.w@email.com', '(555) 222-3344', CURRENT_DATE + 1, '19:00'::time, 4, 'confirmed', 'Birthday celebration', NOW() - INTERVAL '3 days'),
        ('Carol Martinez', 'carol.m@email.com', '(555) 333-4455', CURRENT_DATE + 2, '19:30'::time, 6, 'pending', 'Business dinner', NOW() - INTERVAL '1 day'),
        ('David Thompson', 'david.t@email.com', '(555) 444-5566', CURRENT_DATE + 2, '20:00'::time, 2, 'confirmed', NULL, NOW() - INTERVAL '4 days'),
        ('Eva Brown', 'eva.b@email.com', '(555) 555-6677', CURRENT_DATE + 3, '18:30'::time, 8, 'confirmed', 'Family gathering', NOW() - INTERVAL '5 days'),
        ('Frank Miller', 'frank.m@email.com', '(555) 666-7788', CURRENT_DATE - 1, '19:00'::time, 4, 'completed', NULL, NOW() - INTERVAL '7 days'),
        ('Grace Davis', 'grace.d@email.com', '(555) 777-8899', CURRENT_DATE - 2, '20:00'::time, 2, 'completed', 'Requested quiet table', NOW() - INTERVAL '8 days'),
        ('Henry Wilson', 'henry.w@email.com', '(555) 888-9900', CURRENT_DATE - 3, '18:00'::time, 6, 'cancelled', 'Cancelled due to emergency', NOW() - INTERVAL '6 days'),
        ('Iris Clark', 'iris.c@email.com', '(555) 999-0011', CURRENT_DATE + 4, '19:00'::time, 4, 'confirmed', NULL, NOW() - INTERVAL '1 day'),
        ('Jack Anderson', 'jack.a@email.com', '(555) 000-1122', CURRENT_DATE + 5, '19:30'::time, 2, 'pending', 'First time guest', NOW())
    ) AS v(name, email, phone, reservation_date, reservation_time, party_size, status, notes, created_at)
    CROSS JOIN LATERAL (
        SELECT id FROM public.tables t
        WHERE t.capacity >= v.party_size
        AND NOT EXISTS (
            SELECT 1 FROM public.reservations r
            WHERE r.table_id = t.id
            AND r.date = v.reservation_date
            AND r.time = v.reservation_time
            AND r.status IN ('pending', 'confirmed')
        )
        ORDER BY t.capacity
        LIMIT 1
    ) AS t;

-- Insert analytics metrics
INSERT INTO public.analytics_metrics (
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
        'average_order_value', ROUND(AVG(total_amount)::numeric, 2)
    ) as metric_value,
    tstzrange(
        date_trunc('day', created_at),
        date_trunc('day', created_at) + interval '1 day'
    ) as calculation_period
FROM public.orders
GROUP BY date_trunc('day', created_at);

-- Insert item performance metrics
INSERT INTO public.analytics_metrics (
    metric_type,
    metric_name,
    metric_value,
    calculation_period
)
SELECT
    'item_performance' as metric_type,
    'popular_items' as metric_name,
    jsonb_build_object(
        'item_id', item_id,
        'item_name', item_name,
        'total_quantity', SUM(quantity),
        'total_revenue', SUM(total_price),
        'order_count', COUNT(DISTINCT order_id)
    ) as metric_value,
    tstzrange(
        date_trunc('day', NOW() - interval '30 days'),
        date_trunc('day', NOW() + interval '1 day')
    ) as calculation_period
FROM public.order_items
GROUP BY item_id, item_name;

-- Insert reservation analytics
INSERT INTO public.analytics_metrics (
    metric_type,
    metric_name,
    metric_value,
    calculation_period
)
SELECT
    'daily_reservations' as metric_type,
    'reservation_summary' as metric_name,
    jsonb_build_object(
        'total_reservations', COUNT(*),
        'total_guests', SUM(party_size),
        'average_party_size', ROUND(AVG(party_size)::numeric, 2),
        'completion_rate', ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric * 100), 2)
    ) as metric_value,
    tstzrange(
        date_trunc('day', date),
        date_trunc('day', date) + interval '1 day'
    ) as calculation_period
FROM public.reservations
GROUP BY date_trunc('day', date);
