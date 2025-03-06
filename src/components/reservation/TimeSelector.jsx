import React from 'react';
import { format } from 'date-fns';
import { useReservation } from '@/context';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function TimeSelector({ selectedDate, partySize, onSelectTime }) {
  console.log('Rendering TimeSelector:', { selectedDate, partySize });
  const { loading, timeSlots, config } = useReservation();
  console.log('TimeSelector context values:', { loading, timeSlots, config });

  if (!config) {
    console.log('No config available in TimeSelector');
    return <LoadingSpinner />;
  }

  const formatTime = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (err) {
      console.error('Error formatting time:', err);
      return time;
    }
  };

  const getDayOfWeek = (date) => {
    try {
      return format(date, 'EEEE').toLowerCase();
    } catch (err) {
      console.error('Error getting day of week:', err);
      return '';
    }
  };

  const getOperatingHours = (date) => {
    try {
      if (!config) return null;

      // Check if it's a holiday
      const dateStr = format(date, 'yyyy-MM-dd');
      const holiday = config.holidays.find(h => h.date === dateStr);
      if (holiday) {
        if (!holiday.isOpen) return 'Closed (Holiday)';
        if (holiday.shifts) {
          return holiday.shifts.map(shift => 
            `${formatTime(shift.open)} - ${formatTime(shift.close)}`
          ).join(' & ');
        }
      }

      // Get regular operating hours
      const dayOfWeek = getDayOfWeek(date);
      console.log('Getting operating hours for:', { dayOfWeek, date });
      const dayConfig = config.operatingHours[dayOfWeek];
      console.log('Day config:', dayConfig);
      
      if (!dayConfig?.isOpen) return 'Closed';

      return dayConfig.shifts.map(shift => 
        `${formatTime(shift.open)} - ${formatTime(shift.close)}`
      ).join(' & ');
    } catch (err) {
      console.error('Error getting operating hours:', err);
      return 'Error loading hours';
    }
  };

  const hasAvailableSlots = timeSlots.some(slot => slot.available);
  console.log('Available slots:', { hasAvailableSlots, timeSlots });

  return (
    <div>
      {/* Operating Hours */}
      <div className="mb-6 text-sm text-gray-600">
        <p>Hours for {format(selectedDate, 'EEEE')}: {getOperatingHours(selectedDate)}</p>
      </div>

      {/* Time Slots Grid */}
      <div className="relative">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : timeSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {timeSlots.map((slot) => {
              const isAvailable = slot.available;
              return (
                <button
                  key={slot.time}
                  onClick={() => {
                    if (isAvailable) {
                      console.log('Time slot selected:', slot.time);
                      onSelectTime(slot.time);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`px-4 py-3 text-center border rounded-lg transition-colors ${
                    isAvailable
                      ? 'border-orange-600 hover:bg-orange-50 cursor-pointer'
                      : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                  title={isAvailable ? 'Available' : 'Not Available'}
                >
                  <span className={`block font-medium ${
                    isAvailable ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    {formatTime(slot.time)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No available times for the selected date and party size.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
