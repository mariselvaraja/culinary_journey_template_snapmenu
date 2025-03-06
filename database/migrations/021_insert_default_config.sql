-- First, clear any existing configuration
DELETE FROM configurations WHERE key = 'reservation';

-- Insert the default reservation configuration
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
        ),
        'holidays', jsonb_build_array(
            jsonb_build_object(
                'date', '2024-12-25',
                'name', 'Christmas Day',
                'isOpen', false
            ),
            jsonb_build_object(
                'date', '2024-12-31',
                'name', 'New Year''s Eve',
                'isOpen', true,
                'shifts', jsonb_build_array(
                    jsonb_build_object('open', '11:30', 'close', '14:30'),
                    jsonb_build_object('open', '17:00', 'close', '21:00')
                )
            )
        )
    )
);

-- Insert sample orders for analytics
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
SELECT * FROM (VALUES
    ('John Smith', 'john.smith@email.com', '(555) 123-4567', 'takeout', 'completed', NOW() - INTERVAL '2 hours', 156.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW() - INTERVAL '2 hours'),
    ('Emma Wilson', 'emma.w@email.com', '(555) 234-5678', 'takeout', 'completed', NOW() - INTERVAL '1 day', 98.00, 'credit_card', 'mobile', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
    ('Michael Brown', 'michael.b@email.com', '(555) 345-6789', 'takeout', 'pending', NOW() + INTERVAL '2 hours', 224.00, 'credit_card', 'desktop', 'Mozilla/5.0', NOW())
) AS v(name, email, phone, type, status, pickup, amount, payment, device, agent, created)
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

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
        'average_order_value', ROUND(AVG(total_amount)::numeric, 2)
    ) as metric_value,
    tstzrange(
        date_trunc('day', created_at),
        date_trunc('day', created_at) + interval '1 day'
    ) as calculation_period
FROM orders
GROUP BY date_trunc('day', created_at)
ON CONFLICT DO NOTHING;
