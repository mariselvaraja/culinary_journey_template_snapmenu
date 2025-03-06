import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar, Users } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useReservation } from '@/context';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TimeSelector } from './TimeSelector';
import { ReservationForm } from './ReservationForm';
import { WaitlistForm } from './WaitlistForm';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ReservationPage error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Reservation System</h2>
                <p className="text-gray-600">
                  {typeof this.state.error === 'string' 
                    ? this.state.error 
                    : this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <p className="mt-4 text-gray-600">Please try again later or contact us directly at (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ReservationPageContent() {
  const { loading, error, timeSlots, config, fetchTimeSlots } = useReservation();

  // Define all state variables first
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [partySize, setPartySize] = useState('2');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  // Define all handlers
  const handleTimeSelect = (time) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
    setShowReservationForm(true);
  };

  const filterDate = (date) => {
    if (!config) return false;
    
    // Check if it's a holiday
    const dateStr = format(date, 'yyyy-MM-dd');
    const holiday = config.holidays.find(h => h.date === dateStr);
    if (holiday) {
      return holiday.isOpen;
    }

    // Check regular operating hours
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const dayConfig = config.operatingHours[dayOfWeek];
    return dayConfig?.isOpen;
  };

  // Refresh time slots on mount and when date/party size changes
  useEffect(() => {
    console.log('useEffect triggered:', { selectedDate, partySize });
    const refreshTimeSlots = async () => {
      if (selectedDate && partySize) {
        console.log('Fetching time slots:', { date: format(selectedDate, 'yyyy-MM-dd'), partySize });
        await fetchTimeSlots(format(selectedDate, 'yyyy-MM-dd'), parseInt(partySize));
      }
    };

    refreshTimeSlots();

    // Set up interval to refresh every 30 seconds
    const intervalId = setInterval(refreshTimeSlots, 30000);

    // Set up focus event listener
    const handleFocus = () => refreshTimeSlots();
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedDate, partySize, fetchTimeSlots]);

  // Show error state
  if (error) {
    console.error('Reservation error:', error);
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Reservation System</h2>
              <p className="text-gray-600">
                {typeof error === 'string' ? error : 'An unexpected error occurred'}
              </p>
              <p className="mt-4 text-gray-600">Please try again later or contact us directly at (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || !config) {
    console.log('Loading state:', { loading, config });
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Party size options from config
  const partySizeOptions = Array.from(
    { length: config.maxPartySize - config.minPartySize + 1 },
    (_, i) => i + config.minPartySize
  );

  // Date picker min/max dates
  const minDate = startOfDay(new Date());
  const maxDate = addDays(minDate, config.maxAdvanceDays);

  if (showReservationForm && selectedTime) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <ReservationForm
              date={format(selectedDate, 'yyyy-MM-dd')}
              time={selectedTime}
              partySize={partySize}
              onClose={() => setShowReservationForm(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showWaitlist) {
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const defaultTime = config.operatingHours[dayOfWeek]?.shifts[0]?.open;

    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <WaitlistForm
              date={format(selectedDate, 'yyyy-MM-dd')}
              time={defaultTime}
              partySize={partySize}
              onClose={() => setShowWaitlist(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif mb-2">Make a Reservation</h1>
            <p className="text-gray-600">Select a date, party size, and time for your reservation</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            {/* Date Picker */}
            <div className="relative min-w-[200px]">
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  minDate={minDate}
                  maxDate={maxDate}
                  filterDate={filterDate}
                  dateFormat="EEE, MMM d"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Party Size Selector */}
            <div className="relative min-w-[200px]">
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
              >
                {partySizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Time Selector */}
          <TimeSelector
            selectedDate={selectedDate}
            partySize={partySize}
            onSelectTime={handleTimeSelect}
          />

          {/* Additional Information */}
          <div className="mt-8 text-sm text-gray-500 space-y-2">
            <p>• Reservations are held for {config.reservationHoldTime} minutes past the scheduled time</p>
            <p>• For parties larger than {config.maxPartySize}, please call us directly</p>
            {config.allowSameDay ? (
              <p>• Same-day reservations are available</p>
            ) : (
              <p>• Reservations must be made at least {config.minNoticeHours} hours in advance</p>
            )}
            <p>• For immediate assistance, please call us at (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReservationPage() {
  return (
    <ErrorBoundary>
      <ReservationPageContent />
    </ErrorBoundary>
  );
}
