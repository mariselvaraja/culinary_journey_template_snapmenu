-- First, let's check what day we're getting
DO $$ 
DECLARE 
    current_day text;
    config_value jsonb;
BEGIN
    -- Get the current day name in lowercase
    current_day := lower(to_char(CURRENT_DATE, 'day'));
    -- Trim any whitespace
    current_day := trim(current_day);
    
    -- Get the configuration
    SELECT value INTO config_value
    FROM configurations 
    WHERE key = 'reservation';
    
    -- Log the values
    RAISE NOTICE 'Current day: "%"', current_day;
    RAISE NOTICE 'Operating hours: %', config_value->'operatingHours'->current_day;
END $$;

-- Update the check_table_availability function to handle day names properly
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
        -- Get regular operating hours
        -- Get the day name and trim whitespace
        current_day := trim(lower(to_char(check_date, 'day')));
        RAISE NOTICE 'Current day: "%"', current_day;
        
        day_config := config->'operatingHours'->current_day;
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

-- Update get_available_time_slots to use the same day handling
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
        -- Get regular operating hours
        current_day := trim(lower(to_char(check_date, 'day')));
        RAISE NOTICE 'Current day: "%"', current_day;
        
        day_config := config->'operatingHours'->current_day;
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

-- Let's check what we have in the configuration
SELECT key, value->'operatingHours' 
FROM configurations 
WHERE key = 'reservation';

-- Test with explicit day name
SELECT * FROM check_table_availability(CURRENT_DATE, '12:00'::time, 2, 2);
