import React, { createContext, useContext, useState } from 'react';
import siteContent from '@/data/site-content.json';

export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(siteContent);

  // Function to update content data
  const updateContent = (newContent) => {
    setContent(newContent);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
