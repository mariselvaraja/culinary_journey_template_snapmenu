-- First, drop the existing functions
DROP FUNCTION IF EXISTS check_table_availability(date, time, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_available_time_slots(date, integer, integer) CASCADE;

-- Create a helper function to get the day name in the correct format
CREATE OR REPLACE FUNCTION get_day_name(check_date date)
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Convert the date to a day name and normalize it
    RETURN regexp_replace(lower(to_char(check_date, 'day')), '\s+$', '');
END;
$function$;

-- Create check_table_availability function with robust day handling
CREATE OR REPLACE FUNCTION check_table_availability(
    check_date date,
    check_time time,
    required_capacity integer,
    duration_hours integer
)
RETURNS TABLE (
    available boolean,
    table_id uuid,
    message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
    end_time time;
    config jsonb;
    day_config jsonb;
    holiday jsonb;
    is_open boolean;
    shifts jsonb;
    shift jsonb;
    shift_open time;
    shift_close time;
    is_within_shift boolean := false;
    current_day text;
begin
    -- Calculate end time based on duration
    end_time := check_time + (duration_hours || ' hours')::interval;

    -- Get configuration
    SELECT value INTO config
    FROM configurations
    WHERE key = 'reservation';

    -- Check if it's a holiday
    SELECT value INTO holiday
    FROM jsonb_array_elements(config->'holidays') AS value
    WHERE value->>'date' = check_date::text;

    IF holiday IS NOT NULL THEN
        is_open := (holiday->>'isOpen')::boolean;
        IF NOT is_open THEN
            RETURN QUERY
            SELECT false, NULL::uuid, 'Restaurant is closed for holiday'::text;
            RETURN;
        END IF;
        shifts := holiday->'shifts';
    ELSE
        -- Get regular operating hours using the helper function
        current_day := get_day_name(check_date);
        RAISE NOTICE 'Current day: "%"', current_day;
        
        -- Get all operating hours keys
        WITH day_keys AS (
            SELECT jsonb_object_keys(config->'operatingHours') AS key
        )
        SELECT config->'operatingHours'->(
            SELECT key 
            FROM day_keys 
            WHERE regexp_replace(key, '\s+$', '') = current_day
            LIMIT 1
        ) INTO day_config;
        
        RAISE NOTICE 'Day config: %', day_config;
        
        IF day_config IS NULL THEN
            RETURN QUERY
            SELECT false, NULL::uuid, 'Invalid day configuration'::text;
            RETURN;
        END IF;
        
        is_open := (day_config->>'isOpen')::boolean;
        IF NOT is_open THEN
            RETURN QUERY
            SELECT false, NULL::uuid, 'Restaurant is closed on this day'::text;
            RETURN;
        END IF;
        shifts := day_config->'shifts';
    END IF;

    -- Check if time is within any shift
    FOR shift IN SELECT * FROM jsonb_array_elements(shifts)
    LOOP
        shift_open := (shift->>'open')::time;
        shift_close := (shift->>'close')::time;
        
        IF check_time >= shift_open AND end_time <= shift_close THEN
            is_within_shift := true;
            EXIT;
        END IF;
    END LOOP;

    IF NOT is_within_shift THEN
        RETURN QUERY
        SELECT false, NULL::uuid, 'Time is outside operating hours'::text;
        RETURN;
    END IF;

    -- Check table availability
    RETURN QUERY
    WITH available_tables AS (
        SELECT t.id, t.capacity
        FROM tables t
        WHERE t.is_active = true
        AND t.capacity >= required_capacity
        AND NOT EXISTS (
            SELECT 1
            FROM reservations r
            WHERE r.table_id = t.id
            AND r.reservation_date = check_date
            AND r.status IN ('pending', 'confirmed')
            AND (
                (r.reservation_time >= check_time AND r.reservation_time < end_time) OR
                (r.reservation_time < check_time AND (r.reservation_time + (duration_hours || ' hours')::interval) > check_time) OR
                (r.reservation_time <= check_time AND (r.reservation_time + (duration_hours || ' hours')::interval) >= end_time)
            )
        )
        ORDER BY t.capacity
        LIMIT 1
    )
    SELECT
        CASE WHEN EXISTS (SELECT 1 FROM available_tables) THEN true ELSE false END,
        (SELECT id FROM available_tables),
        CASE
            WHEN NOT EXISTS (SELECT 1 FROM tables WHERE capacity >= required_capacity)
            THEN 'No tables available for this party size'
            WHEN EXISTS (SELECT 1 FROM available_tables)
            THEN 'Table available'
            ELSE 'No tables available for this time slot'
        END;
END;
$function$;

-- Create get_available_time_slots function with robust day handling
CREATE OR REPLACE FUNCTION get_available_time_slots(
    check_date date,
    party_size integer,
    duration_hours integer DEFAULT 2
)
RETURNS TABLE (
    time_slot time,
    available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
    config jsonb;
    day_config jsonb;
    holiday jsonb;
    is_open boolean;
    shifts jsonb;
    shift jsonb;
    shift_open time;
    shift_close time;
    interval_minutes integer;
    slot_time time;
    slot_end_time time;
    availability record;
    current_day text;
begin
    -- Get configuration
    SELECT value INTO config
    FROM configurations
    WHERE key = 'reservation';

    interval_minutes := (config->>'timeSlotInterval')::integer;

    -- Check if it's a holiday
    SELECT value INTO holiday
    FROM jsonb_array_elements(config->'holidays') AS value
    WHERE value->>'date' = check_date::text;

    IF holiday IS NOT NULL THEN
        is_open := (holiday->>'isOpen')::boolean;
        IF NOT is_open THEN
            RETURN;
        END IF;
        shifts := holiday->'shifts';
    ELSE
        -- Get regular operating hours using the helper function
        current_day := get_day_name(check_date);
        RAISE NOTICE 'Current day: "%"', current_day;
        
        -- Get all operating hours keys
        WITH day_keys AS (
            SELECT jsonb_object_keys(config->'operatingHours') AS key
        )
        SELECT config->'operatingHours'->(
            SELECT key 
            FROM day_keys 
            WHERE regexp_replace(key, '\s+$', '') = current_day
            LIMIT 1
        ) INTO day_config;
        
        RAISE NOTICE 'Day config: %', day_config;
        
        IF day_config IS NULL THEN
            RETURN;
        END IF;
        
        is_open := (day_config->>'isOpen')::boolean;
        IF NOT is_open THEN
            RETURN;
        END IF;
        shifts := day_config->'shifts';
    END IF;

    -- Generate time slots for each shift
    FOR shift IN SELECT * FROM jsonb_array_elements(shifts)
    LOOP
        shift_open := (shift->>'open')::time;
        shift_close := (shift->>'close')::time;
        slot_time := shift_open;

        WHILE slot_time < shift_close LOOP
            slot_end_time := slot_time + (duration_hours || ' hours')::interval;
            
            -- Only include slot if the entire duration fits within the shift
            IF slot_end_time <= shift_close THEN
                SELECT * INTO availability 
                FROM check_table_availability(check_date, slot_time, party_size, duration_hours);

                RETURN QUERY
                SELECT 
                    slot_time,
                    availability.available;
            END IF;

            slot_time := slot_time + (interval_minutes || ' minutes')::interval;
        END LOOP;
    END LOOP;
END;
$function$;

-- Update the configuration with normalized day names
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
WHERE key = 'reservation';

-- Test the helper function
SELECT get_day_name(CURRENT_DATE);

-- Test with current date
SELECT * FROM check_table_availability(CURRENT_DATE, '12:00'::time, 2, 2);

-- Test get_available_time_slots
SELECT * FROM get_available_time_slots(CURRENT_DATE, 2);
