-- First check if we have any configuration
SELECT * FROM configurations WHERE key = 'reservation';

-- Insert default configuration if it doesn't exist
INSERT INTO configurations (key, value)
SELECT 
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
            ),
            jsonb_build_object(
                'date', '2025-01-01',
                'name', 'New Year''s Day',
                'isOpen', false
            ),
            jsonb_build_object(
                'date', '2025-07-04',
                'name', 'Independence Day',
                'isOpen', false
            ),
            jsonb_build_object(
                'date', '2025-11-28',
                'name', 'Thanksgiving',
                'isOpen', false
            ),
            jsonb_build_object(
                'date', '2025-12-25',
                'name', 'Christmas Day',
                'isOpen', false
            )
        )
    )
WHERE NOT EXISTS (
    SELECT 1 FROM configurations WHERE key = 'reservation'
);

-- Check if we have any tables
SELECT * FROM tables;

-- Insert sample tables if none exist
INSERT INTO tables (number, capacity)
SELECT * FROM (
    VALUES 
        (1, 2),
        (2, 2),
        (3, 4),
        (4, 4),
        (5, 4),
        (6, 6),
        (7, 6),
        (8, 8),
        (9, 8),
        (10, 10)
) AS t (number, capacity)
WHERE NOT EXISTS (
    SELECT 1 FROM tables
);

-- Now test the function with today's date
SELECT * FROM get_available_time_slots(CURRENT_DATE, 2);

-- Also test with a specific date and time
SELECT * FROM check_table_availability(CURRENT_DATE, '12:00'::time, 2, 2);
