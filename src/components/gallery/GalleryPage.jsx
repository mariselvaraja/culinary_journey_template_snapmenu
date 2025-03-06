import React, { useState } from 'react';
import { useContent } from '@/context/contexts/ContentContext';
import { X } from 'lucide-react';

export function GalleryPage() {
  const { content } = useContent();
  const galleryData = content?.gallery || { section: {}, images: [] };
  const [selectedImage, setSelectedImage] = useState(null);

  // Lightbox functionality
  const openLightbox = (image) => setSelectedImage(image);
  const closeLightbox = () => setSelectedImage(null);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            {galleryData.section.title || 'Our Gallery'}
          </h1>
          <p className="text-xl text-gray-600">
            {galleryData.section.subtitle || 'Explore our beautiful moments and creations'}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryData.images.map((item, index) => (
            <div 
              key={index} 
              className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white text-xl font-medium">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {galleryData.images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No gallery images available.</p>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={closeLightbox}
            >
              <X size={32} />
            </button>
            <div className="max-w-4xl max-h-[90vh]">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="mt-4 text-white">
                <h2 className="text-2xl font-medium">{selectedImage.title}</h2>
                <p className="text-gray-300">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
