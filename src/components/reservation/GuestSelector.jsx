import React from 'react';
import { Users } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { reservationConfig } from '../../config/reservationConfig';

export function GuestSelector({ value, onChange, error }) {
  const { content } = useContent();
  const { labels } = content.reservation.form;

  const guestOptions = Array.from(
    { length: reservationConfig.maxPartySize - reservationConfig.minPartySize + 1 }, 
    (_, i) => i + reservationConfig.minPartySize
  );

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === 'large-party' ? '' : selectedValue);
    
    if (selectedValue === 'large-party') {
      // You might want to handle large party requests differently
      // For example, show a modal or redirect to a contact form
      alert(`For parties larger than ${reservationConfig.maxPartySize}, please call us directly.`);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{labels.guests}</label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select number of guests</option>
          {guestOptions.map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
          <option value="large-party">More than {reservationConfig.maxPartySize} Guests</option>
        </select>
        <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <p className="text-gray-500 text-sm">
        For special events or large parties, please contact us directly.
      </p>
    </div>
  );
}
