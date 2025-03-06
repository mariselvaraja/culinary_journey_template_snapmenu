import React, { useMemo } from 'react';
import { useReservation } from '@/context/contexts/ReservationContext';
import { format, parse } from 'date-fns';

export function TimeSelector({ selectedTime, onTimeSelect }) {
  const { timeSlots } = useReservation();

  const groupedTimeSlots = useMemo(() => {
    const groups = {
      'Morning': [],
      'Afternoon': [],
      'Evening': []
    };

    timeSlots.forEach(slot => {
      const time = parse(slot.time, 'HH:mm:ss', new Date());
      const hour = time.getHours();

      if (hour < 12) {
        groups['Morning'].push(slot);
      } else if (hour < 17) {
        groups['Afternoon'].push(slot);
      } else {
        groups['Evening'].push(slot);
      }
    });

    return groups;
  }, [timeSlots]);

  const formatTime = (time) => {
    const parsed = parse(time, 'HH:mm:ss', new Date());
    return format(parsed, 'h:mm a');
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedTimeSlots).map(([period, slots]) => (
        slots.length > 0 && (
          <div key={period} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{period}</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  className={`
                    px-3 py-2 text-sm rounded-lg transition-all duration-200
                    ${
                      selectedTime === slot.time
                        ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-600 ring-offset-2'
                        : slot.available
                        ? 'bg-white text-gray-700 border border-gray-300 hover:border-orange-500 hover:text-orange-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>
        )
      ))}
      {timeSlots.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">Please select a date and party size to view available times</p>
        </div>
      )}
      {timeSlots.length > 0 && !timeSlots.some(slot => slot.available) && (
        <div className="text-center py-4">
          <p className="text-yellow-600">No available time slots for the selected date</p>
          <p className="text-sm text-gray-500 mt-1">Please try another date or join our waitlist</p>
        </div>
      )}
    </div>
  );
}
