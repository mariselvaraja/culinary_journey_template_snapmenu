import React from 'react';
import { Clock, ChefHat } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

export function BlogPost({ post }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative h-[400px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-serif text-white mb-2">{post.title}</h2>
            <p className="text-white/80">{post.subtitle}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span>{post.chef}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {post.content}
          </p>

          <VideoPlayer 
            thumbnail={post.videoThumbnail}
            videoUrl={post.videoUrl}
          />
        </div>
      </div>
    </article>
  );
}