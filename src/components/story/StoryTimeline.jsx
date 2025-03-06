import React from 'react';

export function StoryTimeline() {
  const milestones = [
    {
      year: "1947",
      title: "The Beginning",
      description: "Jean-Pierre Maison opens a small bistro in New York, bringing authentic French cuisine to the city.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80"
    },
    {
      year: "1968",
      title: "A New Generation",
      description: "Marie Maison introduces innovative techniques while preserving traditional recipes, earning our first Michelin star.",
      image: "https://images.unsplash.com/photo-1428515613728-6b4607e44363?auto=format&fit=crop&q=80"
    },
    {
      year: "1995",
      title: "Evolution",
      description: "Under Philippe Maison's guidance, we expand our wine cellar and introduce seasonal tasting menus.",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80"
    },
    {
      year: "Today",
      title: "Modern Legacy",
      description: "While embracing modern gastronomy, we remain true to our roots, offering timeless experiences.",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">Our Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A legacy of culinary excellence spanning over seven decades
          </p>
        </div>

        <div className="space-y-24">
          {milestones.map((milestone, index) => (
            <div 
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
            >
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-orange-100/50 rounded-2xl transform rotate-2"></div>
                  <img
                    src={milestone.image}
                    alt={milestone.title}
                    className="relative rounded-lg w-full h-[300px] object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="inline-block px-4 py-1 bg-orange-100 text-orange-800 rounded-full font-serif">
                  {milestone.year}
                </div>
                <h3 className="text-3xl font-serif">{milestone.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}