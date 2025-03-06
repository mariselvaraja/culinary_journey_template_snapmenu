// Menu item type definition
export const MenuItemShape = {
  id: '',
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  subCategory: '',
  calories: 0,
  nutrients: {
    protein: '',
    carbs: '',
    fat: ''
  },
  allergens: [],
  dietary: {
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  pairings: [],
  ingredients: []
};

// Menu category type definition
export const MenuCategoryShape = {
  id: '',
  name: '',
  subCategories: [{
    id: '',
    name: ''
  }]
};