/**
 * Restaurant reservation configuration
 */
export const reservationConfig = {
  // Maximum party size
  maxPartySize: 12,

  // Maximum days in advance for reservations
  maxAdvanceDays: 30,

  // Minimum notice required for reservations (in hours)
  minNoticeHours: 2,

  // Restaurant operating hours with multiple shifts
  operatingHours: {
    monday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' }, // Lunch service
        { open: '17:00', close: '22:00' }  // Dinner service
      ]
    },
    tuesday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '22:00' }
      ]
    },
    wednesday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '22:00' }
      ]
    },
    thursday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '22:00' }
      ]
    },
    friday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '23:00' }
      ]
    },
    saturday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '23:00' }
      ]
    },
    sunday: {
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '22:00' }
      ]
    }
  },

  // Special dates (holidays, events, etc.)
  holidays: [
    {
      date: '2024-12-25',
      name: 'Christmas Day',
      isOpen: false
    },
    {
      date: '2024-12-31',
      name: 'New Year\'s Eve',
      isOpen: true,
      shifts: [
        { open: '11:30', close: '14:30' },
        { open: '17:00', close: '21:00' } // Early close
      ]
    },
    {
      date: '2025-01-01',
      name: 'New Year\'s Day',
      isOpen: false
    },
    {
      date: '2025-07-04',
      name: 'Independence Day',
      isOpen: false
    },
    {
      date: '2025-11-28',
      name: 'Thanksgiving',
      isOpen: false
    },
    {
      date: '2025-12-25',
      name: 'Christmas Day',
      isOpen: false
    }
  ],

  // Time slot interval in minutes
  timeSlotInterval: 30,

  // Hold time for reservations (in minutes)
  reservationHoldTime: 15,

  // Whether to allow same-day reservations
  allowSameDay: true,

  // Minimum party size
  minPartySize: 1,

  // Whether to require a phone number
  requirePhone: true,

  // Whether to require an email
  requireEmail: true,

  // Maximum length for special requests
  maxSpecialRequestLength: 500
};

/**
 * Generate time slots based on operating hours and interval
 * @param {string} dayOfWeek - The day of the week (lowercase)
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {string[]} Array of time slots
 */
export function generateTimeSlots(dayOfWeek, date) {
  // First check if it's a holiday
  const holiday = reservationConfig.holidays.find(h => h.date === date);
  if (holiday) {
    if (!holiday.isOpen) return [];
    if (holiday.shifts) {
      return generateTimeSlotsFromShifts(holiday.shifts);
    }
  }

  // Get regular day configuration
  const dayConfig = reservationConfig.operatingHours[dayOfWeek.toLowerCase()];
  if (!dayConfig || !dayConfig.isOpen || !dayConfig.shifts.length) return [];

  return generateTimeSlotsFromShifts(dayConfig.shifts);
}

/**
 * Generate time slots for given shifts
 * @param {Array<{open: string, close: string}>} shifts - Array of shift objects
 * @returns {string[]} Array of time slots
 */
function generateTimeSlotsFromShifts(shifts) {
  const slots = [];
  const interval = reservationConfig.timeSlotInterval;

  shifts.forEach(shift => {
    let current = new Date(`2024-01-01T${shift.open}`);
    const end = new Date(`2024-01-01T${shift.close}`);

    while (current < end) {
      slots.push(current.toTimeString().slice(0, 5));
      current = new Date(current.getTime() + interval * 60000);
    }
  });

  return slots.sort();
}

/**
 * Check if a date is valid for reservations
 * @param {string} date - The date to check (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isValidReservationDate(date) {
  // Check if it's a holiday
  const holiday = reservationConfig.holidays.find(h => h.date === date);
  if (holiday) {
    return holiday.isOpen;
  }

  const reservationDate = new Date(date);
  const dayOfWeek = reservationDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const dayConfig = reservationConfig.operatingHours[dayOfWeek];

  // Check if the day is open
  if (!dayConfig || !dayConfig.isOpen) {
    return false;
  }

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + reservationConfig.maxAdvanceDays);

  // Check if date is within valid range
  if (reservationDate > maxDate) {
    return false;
  }

  // Check if it's same day and allowed
  if (reservationDate.toDateString() === today.toDateString()) {
    if (!reservationConfig.allowSameDay) {
      return false;
    }
    // Check minimum notice
    const hours = (reservationDate - today) / (1000 * 60 * 60);
    if (hours < reservationConfig.minNoticeHours) {
      return false;
    }
  }

  return true;
}
