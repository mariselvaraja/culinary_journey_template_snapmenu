import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Close video"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="aspect-video">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/80">
              Video not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}