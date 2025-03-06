import React from 'react';

export function StoryTeam() {
  const team = [
    {
      name: "Philippe Maison",
      role: "Executive Chef & Owner",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80",
      quote: "Every dish tells a story of our heritage and passion for culinary excellence."
    },
    {
      name: "Isabella Romano",
      role: "Head Chef",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
      quote: "We honor tradition while embracing innovation in every creation."
    },
    {
      name: "Marcus Chen",
      role: "Pastry Chef",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80",
      quote: "Desserts are the final brushstroke in the canvas of a perfect meal."
    }
  ];

  return (
    <div className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">The Artisans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the passionate individuals who bring our culinary vision to life
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6 inline-block">
                <div className="absolute -inset-4 bg-orange-100/50 rounded-full transform -rotate-6"></div>
                <img
                  src={member.image}
                  alt={member.name}
                  className="relative w-48 h-48 object-cover rounded-full mx-auto"
                />
              </div>
              <h3 className="text-2xl font-serif mb-2">{member.name}</h3>
              <p className="text-orange-600 mb-4">{member.role}</p>
              <p className="text-gray-600 italic">"{member.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}