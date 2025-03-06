import React from 'react';
import { useContent } from '@/context/contexts/ContentContext';

export function BlogPage() {
  const { content } = useContent();
  const blogPosts = content?.blog?.posts || [];

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            {content?.blog?.header?.title || 'Our Blog'}
          </h1>
          <p className="text-xl text-gray-600">
            {content?.blog?.header?.description || 'Latest news and updates from our kitchen'}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.image && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">{post.date}</div>
                <h2 className="text-xl font-medium text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.subtitle}</p>
                <div className="flex items-center text-sm">
                  <div>
                    <div className="font-medium text-gray-900">
                      {post.chef}
                    </div>
                    <div className="text-gray-500">
                      {post.readTime} read
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
