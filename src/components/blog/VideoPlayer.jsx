import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

export function VideoPlayer({ thumbnail, videoUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef();

  useEffect(() => {
    if (isPlaying && videoRef.current && !playerRef.current) {
      playerRef.current = new Plyr(videoRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      });

      videoRef.current.play();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = undefined;
      }
    };
  }, [isPlaying]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Video not available</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      {!isPlaying ? (
        <>
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button 
              className="bg-orange-600 text-white p-4 rounded-full transform transition-all duration-300 hover:scale-110 hover:bg-orange-700"
              onClick={() => setIsPlaying(true)}
              aria-label="Play video"
            >
              <Play className="h-8 w-8" />
            </button>
          </div>
        </>
      ) : (
        <video
          ref={videoRef}
          className="plyr-react plyr w-full h-full"
          poster={thumbnail}
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}