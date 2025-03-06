import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReservation } from '@/context/contexts/ReservationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReservationForm } from '@/components/reservation/form/ReservationForm';
import { WaitlistForm } from '@/components/reservation/form/WaitlistForm';
import { ReservationConfirmation } from '@/components/reservation/confirmation/ReservationConfirmation';
import { format, startOfToday, isValid } from 'date-fns';
import { Clock, MapPin, Phone } from 'lucide-react';

export function ReservationPage() {
  const [searchParams] = useSearchParams();
  const { loading, timeSlots, config, fetchTimeSlots } = useReservation();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [selectedPartySize, setSelectedPartySize] = useState(Number(searchParams.get('party')) || 2);

  // Parse and validate default values
  const today = startOfToday();
  const defaultDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    if (!dateParam) return today;
    
    const parsedDate = new Date(dateParam);
    if (!isValid(parsedDate)) return today;
    
    // Don't allow dates in the past
    return parsedDate < today ? today : parsedDate;
  }, [searchParams, today]);

  const defaultTime = searchParams.get('time') || '';

  // Format operating hours from config
  const operatingHours = useMemo(() => {
    if (!config?.operatingHours) return [];

    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' }
    ];

    const groupedHours = [];
    let currentGroup = null;

    days.forEach(day => {
      const dayConfig = config.operatingHours[day.key];
      if (!dayConfig?.isOpen) return;

      const hours = dayConfig.shifts.map(shift => `${shift.open} - ${shift.close}`).join(', ');
      
      if (currentGroup && currentGroup.hours === hours) {
        currentGroup.days.push(day.label);
      } else {
        if (currentGroup) {
          groupedHours.push({
            days: currentGroup.days.length > 2 
              ? [`${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`]
              : currentGroup.days,
            hours: currentGroup.hours
          });
        }
        currentGroup = {
          days: [day.label],
          hours
        };
      }
    });

    if (currentGroup) {
      groupedHours.push({
        days: currentGroup.days.length > 2 
          ? [`${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`]
          : currentGroup.days,
        hours: currentGroup.hours
      });
    }

    return groupedHours;
  }, [config]);

  // Handle successful reservation
  const handleReservationComplete = useCallback((reservation) => {
    console.log('Reservation completed:', reservation);
    setConfirmedReservation(reservation);
    window.scrollTo(0, 0); // Scroll to top to show confirmation
  }, []);

  // Check if there are any available time slots
  const hasAvailableSlots = useMemo(() => 
    timeSlots.some(slot => slot.available),
    [timeSlots]
  );

  if (loading && !confirmedReservation) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  // Show confirmation page if reservation is completed
  if (confirmedReservation) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-neutral-50">
        <ReservationConfirmation reservation={confirmedReservation} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Reservation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reserve your table online and enjoy a delightful dining experience. For parties larger than {config?.maxPartySize || 8}, please call us directly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Restaurant Info */}
          <div className="space-y-6 lg:order-last">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                Restaurant Hours
              </h3>
              <div className="space-y-2">
                {operatingHours.map((group, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{group.days.join(', ')}</span>
                    <span className="text-gray-900 font-medium">{group.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                Location
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">123 Culinary Avenue</p>
                <p className="text-gray-600">Gastronomy District</p>
                <p className="text-gray-600">New York, NY 10001</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                Contact
              </h3>
              <p className="text-gray-600">
                For special arrangements or questions, please call us at <span className="text-gray-900 font-medium">(212) 555-0123</span>
              </p>
            </div>
          </div>

          {/* Right Column - Reservation Form */}
          <div className="lg:col-span-2">
            {!hasAvailableSlots && (
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setShowWaitlist(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    !showWaitlist
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Check Other Dates
                </button>
                <button
                  type="button"
                  onClick={() => setShowWaitlist(true)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    showWaitlist
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Join Waitlist
                </button>
              </div>
            )}

            {showWaitlist ? (
              <WaitlistForm
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                defaultPartySize={selectedPartySize}
              />
            ) : (
              <ReservationForm
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                defaultPartySize={selectedPartySize}
                onComplete={handleReservationComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
