import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMenu } from '@/context/contexts/MenuContext';
import searchService from '@/services/searchService';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const { menuData } = useMenu();

  // Initialize search service when menu data changes
  useEffect(() => {
    let mounted = true;

    const initializeSearch = async () => {
      if (!menuData?.menu || !mounted) return;

      try {
        // Only reinitialize if not already initialized or in error state
        if (searchService.state === searchService.SEARCH_STATES.READY) {
          console.log('Search already initialized');
          return;
        }

        console.log('Initializing search with menu data');
        
        // Clean up existing search index
        await searchService.cleanup();
        
        // Transform menu data into searchable format
        const flattenedMenu = Object.entries(menuData.menu).reduce((acc, [category, items]) => {
          if (!Array.isArray(items)) return acc;
          
          const validItems = items
            .filter(item => item && item.id && item.name)
            .map(item => ({
              ...item,
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0,
              category: category,
              subCategory: item.subCategory || '',
              dietary: {
                isVegetarian: item.dietary?.isVegetarian || false,
                isVegan: item.dietary?.isVegan || false,
                isGlutenFree: item.dietary?.isGlutenFree || false
              },
              ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
              allergens: Array.isArray(item.allergens) ? item.allergens : [],
              pairings: Array.isArray(item.pairings) ? item.pairings : [],
              image: item.image || '',
              nutrients: item.nutrients || {},
              calories: typeof item.calories === 'number' ? item.calories : 0
            }));
          
          return [...acc, ...validItems];
        }, []);

        if (flattenedMenu.length === 0) {
          throw new Error('No valid menu items found');
        }

        console.log(`Initializing search with ${flattenedMenu.length} items`);
        await searchService.initializeIndex({ items: flattenedMenu });
        console.log('Search initialization complete');
      } catch (error) {
        console.error('Failed to initialize search:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSearch();

    return () => {
      mounted = false;
    };
  }, [menuData]);

  const search = async (query, options = {}) => {
    if (!query?.trim()) {
      return { results: [], grouped: {} };
    }

    try {
      setIsLoading(true);
      return await searchService.search(query, options);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SearchContext.Provider value={{ search, isLoading }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
