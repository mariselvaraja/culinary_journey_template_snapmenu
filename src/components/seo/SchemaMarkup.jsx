import React from 'react';
import { useMenu } from '@/context/contexts/MenuContext';
import { useLocation } from 'react-router-dom';

// Helper function to get cuisine types from menu
const getCuisineTypes = (menuData) => {
  if (!menuData?.categories) return [];
  return menuData.categories.map(cat => cat.name);
};

// Helper function to get price range
const getPriceRange = (menuData) => {
  if (!menuData?.menu) return '$$';
  let prices = [];
  
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

// Generate menu item schema
const generateMenuItemSchema = (item) => ({
  '@type': 'MenuItem',
  name: item.name,
  description: item.description,
  price: item.price ? `$${item.price}` : undefined,
  image: item.image,
  nutrition: item.nutrients ? {
    '@type': 'NutritionInformation',
    calories: `${item.calories} calories`,
    proteinContent: item.nutrients.protein,
    carbohydrateContent: item.nutrients.carbs,
    fatContent: item.nutrients.fat
  } : undefined,
  suitableForDiet: item.dietary ? [
    item.dietary.isVegetarian && 'VegetarianDiet',
    item.dietary.isVegan && 'VeganDiet',
    item.dietary.isGlutenFree && 'GlutenFreeDiet'
  ].filter(Boolean) : [],
  allergens: item.allergens ? item.allergens.join(', ') : undefined
});

export function SchemaMarkup() {
  const { menuData } = useMenu();
  const location = useLocation();

  if (!menuData?.menu || !menuData?.categories) {
    return null;
  }

  // Base schema
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'SnapMenu',
    image: '/og-image.jpg',
    '@id': 'https://yourdomain.com',
    url: 'https://yourdomain.com',
    telephone: '+1-234-567-8900',
    priceRange: getPriceRange(menuData),
    servesCuisine: getCuisineTypes(menuData),
    acceptsReservations: 'True',
    menu: {
      '@type': 'Menu',
      hasMenuSection: menuData.categories.map(category => ({
        '@type': 'MenuSection',
        name: category.name,
        description: category.description,
        hasMenuItem: (menuData.menu[category.id] || []).map(generateMenuItemSchema)
      }))
    }
  };

  // Add breadcrumb schema for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: location.pathname.split('/')
      .filter(Boolean)
      .map((path, index, arr) => {
        // Get proper name for category paths
        let name = path;
        if (index === 1 && path === 'menu') {
          name = 'Menu';
        } else if (index === 2) {
          const category = menuData.categories.find(cat => cat.id === path);
          if (category) {
            name = category.name;
          }
        }
        
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
          item: `https://yourdomain.com/${arr.slice(0, index + 1).join('/')}`
        };
      })
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(baseSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  );
}
