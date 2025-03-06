// Helper functions for parsing specific fields
const parseNutrientValue = (nutrientsStr, field, altField) => {
  if (!nutrientsStr) return '0g';
  
  const nutrients = parseNutrients(nutrientsStr);
  return nutrients[field] || (altField && nutrients[altField]) || '0g';
};

const parseCalories = (caloriesStr) => {
  if (typeof caloriesStr === 'number') return caloriesStr;
  const match = caloriesStr?.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

const standardizeNutrients = (nutrients) => {
  // Default nutrient structure with 0g values
  const defaultNutrients = {
    protein: "0g",
    carbs: "0g",
    fat: "0g",
    sat: "0g",
    unsat: "0g",
    trans: "0g",
    sugar: "0g",
    fiber: "0g"
  };

  if (!nutrients) return defaultNutrients;

  // Convert old field names to new ones
  const fieldMappings = {
    saturated: "sat",
    unsaturated: "unsat",
    total: "fat"
  };

  const standardized = { ...defaultNutrients };
  
  Object.entries(nutrients).forEach(([key, value]) => {
    // Convert numbers to strings with 'g' suffix
    const stringValue = typeof value === 'number' ? `${value}g` : value;
    // Use mapped field name if it exists, otherwise use original
    const fieldName = fieldMappings[key] || key;
    standardized[fieldName] = stringValue;
  });

  return standardized;
};

const parseNutrients = (nutrients) => {
  if (!nutrients) return {};
  
  // If nutrients is already an object, standardize it
  if (typeof nutrients === 'object') {
    return standardizeNutrients(nutrients);
  }
  
  // Otherwise parse from string
  const parsedNutrients = {};
  const matches = nutrients.match(/(\d+)g\s+(\w+)/g) || [];
  
  matches.forEach(match => {
    const [amount, nutrient] = match.match(/(\d+)g\s+(\w+)/).slice(1);
    parsedNutrients[nutrient.toLowerCase()] = `${amount}g`;
  });

  return standardizeNutrients(parsedNutrients);
};

const parseAllergens = (allergens) => {
  if (!allergens) return [];
  
  // If allergens is already an array, return it
  if (Array.isArray(allergens)) return allergens;
  
  // Otherwise parse from string
  const allergenMatches = allergens.toLowerCase().match(/contains\s+([^.]+)/);
  if (!allergenMatches) return [];
  
  return allergenMatches[1]
    .split(',')
    .map(allergen => allergen.trim())
    .filter(allergen => allergen !== '');
};

const generateId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Function to generate search term for a category
const generateSearchTerm = (category, itemName = null) => {
  // Clean and format the category name
  const formattedCategory = category.replace(/_/g, ' ').toLowerCase();
  
  if (itemName) {
    // For food items, use the name and category
    const cleanName = itemName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    return `indian food ${cleanName} ${formattedCategory} dish`;
  } else {
    // For categories, create a descriptive search term
    return `indian restaurant ${formattedCategory} food dishes cuisine`;
  }
};

export const generateImage = (category, itemName) => {
  const baseUrl = 'https://source.unsplash.com/featured/?';
  const searchTerm = generateSearchTerm(category, itemName);
  const random = Math.random().toString(36).substring(7);
  return `${baseUrl}${encodeURIComponent(searchTerm)}&random=${random}&auto=format&fit=crop&w=900&h=600&q=80`;
};

export const validateMenuStructure = (data) => {
  // Handle both array format and nested menu format
  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data.menu && typeof data.menu === 'object') {
    // Flatten nested menu structure into array of items
    items = Object.entries(data.menu).flatMap(([category, categoryItems]) => {
      if (!Array.isArray(categoryItems)) {
        throw {
          type: 'validation',
          message: `Category "${category}" must contain an array of items`
        };
      }
      return categoryItems.map(item => ({
        ...item,
        section: category,
        price_full: item.price
      }));
    });
  } else {
    throw {
      type: 'validation',
      message: 'Menu data must be either an array of items or a menu object with categories'
    };
  }

    // Check each item has required fields
    items.forEach((item, index) => {
      const missingFields = [];
      if (!item.name) missingFields.push('name');
      // Check if price fields exist but allow null values
      if (!('price' in item) && !('price_full' in item)) missingFields.push('price');
      // section is now optional since it can come from the category

      if (missingFields.length > 0) {
        const itemIdentifier = item.name || item.id || `at index ${index}`;
        throw {
          type: 'validation',
          message: `Menu item "${itemIdentifier}" is missing required fields: ${missingFields.join(', ')}`,
          details: `Found at index ${index}. Required fields are: name and price`,
          item: item
        };
      }

    // Validate price format
    const price = item.price || item.price_full;
    if (price && isNaN(parseFloat(price))) {
      throw {
        type: 'validation',
        message: `Invalid price format for item "${item.name}"`,
        details: `Price "${price}" must be a valid number`,
        item: item
      };
    }
  });

  return items;
};

export const transformMenuData = (rawData) => {
  const ensureImage = (item, section) => {
    if (!item.image) {
      item.image = generateImage(section, item.name);
    }
    return item;
  };

  try {
    // First validate and normalize the data structure
    const items = validateMenuStructure(rawData);
    
    // Group items by section
    const groupedItems = items.reduce((acc, item) => {
      const section = (item.section || item.category || 'other').toLowerCase().replace(/\s+/g, '_');
      if (!acc[section]) acc[section] = [];
      
      // Transform each item to match expected structure
      const transformedItem = ensureImage({
        id: item.id || item.pk_id || generateId(item.name),
        name: item.name,
        description: item.description || item.product_description || item.detailed_description || '',
        price: (item.price || item.price_full || '0').toString(), // Ensure price is a string, default to '0' if null
        image: item.image,
        category: section,
        subCategory: (item.subCategory || item.level2_category || 'other').toLowerCase().replace(/\s+/g, '_'),
        calories: parseCalories(item.calories || item.Calories),
        nutrients: parseNutrients(item.nutrients || item.Nutrients),
        dietary: {
          isVegetarian: item.dietary?.isVegetarian || item.food_type === 'vegetarian' || false,
          isVegan: item.dietary?.isVegan || item.is_vegan === 'yes' || false,
          isGlutenFree: item.dietary?.isGlutenFree || !item.allergy_info?.toLowerCase().includes('gluten') || false
        },
        allergens: parseAllergens(item.allergens || item.allergy_info),
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : 
                    item.ingredients?.split(',').map(i => i.trim()) || [],
        pairings: Array.isArray(item.pairings) ? item.pairings :
                 item.best_combo_ids?.split(',').map(id => id.trim()) || []
      }, section);
      
      acc[section].push(transformedItem);
      return acc;
    }, {});

    // Return in expected format
    return {
      menu: groupedItems
    };
  } catch (error) {
    throw {
      type: 'transformation',
      message: 'Failed to transform menu data',
      details: error.message,
      originalError: error
    };
  }
};

export const validateTransformedMenu = (data) => {
  if (!data.menu || typeof data.menu !== 'object') {
    throw {
      type: 'validation',
      message: 'Transformed menu must have a menu object'
    };
  }

  // Check if at least one category exists
  if (Object.keys(data.menu).length === 0) {
    throw {
      type: 'validation',
      message: 'Transformed menu must have at least one category'
    };
  }

  return true;
};
