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
        'holidays', jsonb_build_array(),
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
        )
    )
);

-- Verify the configuration
SELECT * FROM configurations WHERE key = 'reservation';
