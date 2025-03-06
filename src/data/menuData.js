import menuJson from './menu/menu.json';

// Function to format category name for display
const formatCategoryName = (id) => {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to extract unique subcategories from items in a category
const getSubCategories = (items) => {
  const subCategories = new Set();
  items.forEach(item => {
    if (item.subCategory) {
      subCategories.add(item.subCategory);
    }
  });
  return Array.from(subCategories).map(id => ({
    id,
    name: formatCategoryName(id)
  }));
};

// Dynamically generate categories from menu data
export const categories = Object.entries(menuJson.menu).map(([categoryId, items]) => ({
  id: categoryId,
  name: formatCategoryName(categoryId),
  subCategories: getSubCategories(items)
}));

// Get all menu items from the consolidated menu.json
export const menuItems = Object.values(menuJson.menu)
  .reduce((items, categoryItems) => {
    if (Array.isArray(categoryItems)) {
      return [...items, ...categoryItems];
    }
    return items;
  }, []);
