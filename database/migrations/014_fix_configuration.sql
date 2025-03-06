-- First, let's see what day format PostgreSQL is using
DO $$ 
DECLARE 
    current_day text;
BEGIN
    current_day := trim(lower(to_char(CURRENT_DATE, 'day')));
    RAISE NOTICE 'PostgreSQL day format: "%"', current_day;
END $$;

-- Update the configuration with the correct day format
UPDATE configurations
SET value = jsonb_build_object(
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
        'wednesday ', jsonb_build_object(  -- Note the space after wednesday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'thursday  ', jsonb_build_object(  -- Note the spaces after thursday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'friday   ', jsonb_build_object(  -- Note the spaces after friday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '23:00')
            )
        ),
        'saturday ', jsonb_build_object(  -- Note the space after saturday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '23:00')
            )
        ),
        'sunday   ', jsonb_build_object(  -- Note the spaces after sunday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'monday   ', jsonb_build_object(  -- Note the spaces after monday
            'isOpen', true,
            'shifts', jsonb_build_array(
                jsonb_build_object('open', '11:30', 'close', '14:30'),
                jsonb_build_object('open', '17:00', 'close', '22:00')
            )
        ),
        'tuesday  ', jsonb_build_object(  -- Note the spaces after tuesday
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
WHERE key = 'reservation';

-- Verify the configuration
SELECT key, value->'operatingHours' 
FROM configurations 
WHERE key = 'reservation';

-- Test with current date
SELECT * FROM check_table_availability(CURRENT_DATE, '12:00'::time, 2, 2);

-- Test get_available_time_slots
SELECT * FROM get_available_time_slots(CURRENT_DATE, 2);
