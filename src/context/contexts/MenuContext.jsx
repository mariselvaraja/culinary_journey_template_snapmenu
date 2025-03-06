import React, { createContext, useContext, useEffect, useState } from 'react';
import menuJson from '@/data/menu/menu.json';
import { categories, menuItems } from '@/data/menuData';
import searchService from '@/services/searchService';

export const MenuContext = createContext();

const VERSION_HISTORY_KEY = 'menu_version_history';

export function MenuProvider({ children }) {
  const [menuData, setMenuData] = useState({
    menu: menuJson.menu,
    categories,
    menuItems
  });
  const [searchState, setSearchState] = useState(searchService.SEARCH_STATES.UNINITIALIZED);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [versionHistory, setVersionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(VERSION_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load version history:', error);
      return [];
    }
  });

  // Initialize search index when menu data is available
  useEffect(() => {
    console.log('MenuContext effect running, menu data:', menuData);

    const handleStateChange = (state, error, progress) => {
      console.log('Search state changed:', state, error, progress);
      setSearchState(state);
      setSearchError(error);
      setSearchProgress(progress);
    };

    searchService.addStateListener(handleStateChange);

    let mounted = true;

    const initializeSearch = async () => {
      if (!mounted || !menuData?.menu || searchState !== searchService.SEARCH_STATES.UNINITIALIZED) {
        return;
      }

      console.log('Starting search initialization with menu:', menuData.menu);
      
      // Ensure menu data is valid
      if (typeof menuData.menu !== 'object') {
        console.error('Invalid menu data:', menuData.menu);
        setSearchError('Invalid menu data structure');
        return;
      }

      try {
        // Clean up old search index if it exists
        await searchService.cleanup();
        
        // Flatten menu data into a single array
        const flattenedMenu = [];
        
        // Process each category
        for (const [category, items] of Object.entries(menuData.menu)) {
          console.log(`Processing category ${category}:`, items);
          
          if (!Array.isArray(items)) {
            console.warn(`Skipping invalid category ${category}:`, items);
            continue;
          }

          // Process items in this category
          for (const item of items) {
            if (!item || !item.id || !item.name) {
              console.warn(`Skipping invalid item in ${category}:`, item);
              continue;
            }

            // Add item with validated fields
            const processedItem = {
              ...item, // Keep all original fields
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: parseFloat(item.price) || 0,
              category: category,
              subCategory: item.subCategory || '',
              dietary: item.dietary || {},
              ingredients: item.ingredients || [],
              allergens: item.allergens || [],
              pairings: item.pairings || [],
              image: item.image || '',
              nutrients: item.nutrients || {},
              calories: item.calories || 0
            };

            console.log(`Adding processed item:`, processedItem);
            flattenedMenu.push(processedItem);
          }
        }

        // Log the flattened menu for debugging
        console.log('Flattened menu items:', JSON.stringify(flattenedMenu.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category
        })), null, 2));

        console.log('Flattened menu items:', JSON.stringify(flattenedMenu, null, 2));

        console.log('Processed menu items:', flattenedMenu.length);

        if (flattenedMenu.length === 0) {
          throw new Error('No valid menu items found');
        }

        // Initialize search with validated data
        if (mounted && flattenedMenu.length > 0) {
          // Transform menu data into expected format
          const searchData = {
            items: flattenedMenu.map(item => ({
              ...item,
              // Ensure all fields are present and properly formatted
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0,
              category: item.category,
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
            }))
          };

          console.log('Initializing search with data:', searchData);
          await searchService.initializeIndex(searchData);
        } else {
          console.warn('No menu items to initialize search with');
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to initialize search:', error);
          setSearchError(error.message);
        }
      }
    };

    // Start initialization
    initializeSearch().catch(error => {
      if (mounted) {
        console.error('Search initialization failed:', error);
        setSearchError(error.message);
      }
    });

    return () => {
      console.log('Cleaning up search listener');
      mounted = false;
      searchService.removeStateListener(handleStateChange);
    };
  }, [menuData, searchState]);

  // Save version history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(versionHistory));
    } catch (error) {
      console.error('Failed to save version history:', error);
    }
  }, [versionHistory]);

  // Function to update menu data
  const updateMenu = async (newMenuData) => {
    setMenuData(newMenuData);
    // Reset search state to trigger re-initialization
    setSearchState(searchService.SEARCH_STATES.UNINITIALIZED);
    // Clean up old search index
    await searchService.cleanup();
  };

  // Function to save a new menu version
  const saveNewVersion = (version) => {
    const newVersion = {
      ...version,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    setVersionHistory(prev => [newVersion, ...prev]);
  };

  // Function to get version history
  const getVersionHistory = () => {
    return versionHistory;
  };

  // Function to restore a specific version
  const restoreVersion = async (versionId) => {
    const version = versionHistory.find(v => v.id === versionId);
    if (version) {
      await updateMenu(version.transformed);
      return true;
    }
    return false;
  };

  // Function to delete a version
  const deleteVersion = (versionId) => {
    setVersionHistory(prev => prev.filter(v => v.id !== versionId));
  };

  return (
    <MenuContext.Provider 
      value={{ 
        menuData, 
        updateMenu, 
        searchState, 
        searchProgress, 
        searchError,
        isSearchInitialized: searchState === searchService.SEARCH_STATES.READY,
        saveNewVersion,
        getVersionHistory,
        restoreVersion,
        deleteVersion
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
