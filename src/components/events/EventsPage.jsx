import React from 'react';
import { useContent } from '@/context/contexts/ContentContext';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function EventsPage() {
  const { content } = useContent();
  const eventsData = content?.events || { section: {}, items: [] };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time (assuming 24h format in data)
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            {eventsData.section.title || 'Upcoming Events'}
          </h1>
          <p className="text-xl text-gray-600">
            {eventsData.section.subtitle || 'Join us for special occasions and culinary experiences'}
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {eventsData.items.map((event, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row"
            >
              <div className="md:w-1/3">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3 flex flex-col">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors self-start">
                  Reserve a Spot
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {eventsData.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming events at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
