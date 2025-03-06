// Function to format category name for display
const formatCategoryName = (id) => {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Default high-quality image that works well as a generic category background
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&h=600&q=80';

// Category-specific descriptions
const CATEGORY_DESCRIPTIONS = {
  starters: 'Begin your culinary journey with our carefully curated selection of appetizers, soups, and salads',
  mains: 'Discover our signature main courses, featuring premium ingredients and expert preparation',
  desserts: 'Complete your dining experience with our decadent selection of house-made desserts',
  drinks: 'Complement your meal with our curated selection of wines, cocktails, and non-alcoholic beverages'
};

// Function to generate description for a category
const generateCategoryDescription = (categoryId) => {
  // Return custom description if available
  if (CATEGORY_DESCRIPTIONS[categoryId]) {
    return CATEGORY_DESCRIPTIONS[categoryId];
  }

  // Generate generic description
  const name = formatCategoryName(categoryId);
  return `Explore our selection of ${name.toLowerCase()} dishes, crafted with authentic flavors and traditional recipes`;
};

export function getCategoryImage(id, menuData) {
  try {
    // Check if menu has categoryImages
    if (menuData?.categoryImages && menuData.categoryImages[id]) {
      return menuData.categoryImages[id];
    }

    // Check if any item in the category has an image we can use
    const categoryItems = menuData?.menu?.[id] || [];
    const firstItemWithImage = categoryItems.find(item => item.image);
    if (firstItemWithImage?.image) {
      return firstItemWithImage.image;
    }

    // If no specific image found, return default
    return DEFAULT_CATEGORY_IMAGE;
  } catch (error) {
    console.error(`Error getting image for category ${id}:`, error);
    return DEFAULT_CATEGORY_IMAGE;
  }
}

export function getCategoryDescription(id) {
  return generateCategoryDescription(id);
}

export function formatPrice(price) {
  // Remove any existing currency symbols and convert to number
  const numericPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
  
  // Format with dollar sign and two decimal places
  return `$${numericPrice.toFixed(2)}`;
}

export function calculateItemPrice(price, quantity = 1) {
  // Remove any existing currency symbols and convert to number
  const numericPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
  
  // Calculate total and format with dollar sign and two decimal places
  return formatPrice(numericPrice * quantity);
}

export function getSubCategoryDescription(categoryId, subCategoryId) {
  const category = formatCategoryName(categoryId);
  const subCategory = formatCategoryName(subCategoryId);
  
  return `Discover our ${subCategory.toLowerCase()} selection from our ${category.toLowerCase()} menu`;
}
