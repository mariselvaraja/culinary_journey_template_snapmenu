import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMenu } from '@/context/contexts/MenuContext';
import { useLocation } from 'react-router-dom';
import { SchemaMarkup } from './SchemaMarkup';

// Helper function to get cuisine types from menu
const getCuisineTypes = (menuData) => {
  if (!menuData?.categories) return '';
  return menuData.categories.map(cat => cat.name).join(', ');
};

// Helper function to get price range
const getPriceRange = (menuData) => {
  if (!menuData?.menu) return '$$';
  let prices = [];
  
  // Iterate through all categories in the menu
  Object.values(menuData.menu).forEach(items => {
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (item.price) {
          prices.push(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')));
        }
      });
    }
  });
  
  if (prices.length === 0) return '$$';
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  if (avgPrice <= 15) return '$';
  if (avgPrice <= 30) return '$$';
  if (avgPrice <= 60) return '$$$';
  return '$$$$';
};

export function MetaHead() {
  const { menuData } = useMenu();
  const location = useLocation();
  const currentPath = location.pathname;

  // Base title and description
  let title = 'SnapMenu - Digital Menu & Ordering System';
  let description = 'Explore our diverse menu featuring delicious dishes. Easy online ordering, table reservations, and contactless dining experience.';

  // Customize meta data based on current route
  if (currentPath.startsWith('/menu')) {
    const cuisineTypes = getCuisineTypes(menuData);
    const priceRange = getPriceRange(menuData);
    
    if (currentPath === '/menu') {
      title = `Menu | ${cuisineTypes} | SnapMenu`;
      description = `Explore our ${cuisineTypes} menu. ${priceRange} · Online ordering available · Fresh ingredients`;
    } else {
      // For specific category pages
      const categoryId = currentPath.split('/')[2];
      const category = menuData?.categories?.find(cat => cat.id === categoryId);
      if (category) {
        title = `${category.name} Menu | SnapMenu`;
        description = `Discover our ${category.name.toLowerCase()} selection. ${priceRange} · Fresh ingredients · Quality service`;
      }
    }
  } else if (currentPath === '/reserve') {
    title = 'Make a Reservation | SnapMenu';
    description = 'Book your table online. Quick, easy, and instant confirmation.';
  } else if (currentPath === '/our-story') {
    title = 'Our Story | SnapMenu';
    description = 'Learn about our journey, our values, and our commitment to quality dining experiences.';
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content="/og-image.jpg" />
      </Helmet>
      
      {/* Schema.org markup */}
      <SchemaMarkup />
    </>
  );
}
