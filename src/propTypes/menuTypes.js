import PropTypes from 'prop-types';

export const MenuItemPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  subCategory: PropTypes.string.isRequired,
  calories: PropTypes.number.isRequired,
  nutrients: PropTypes.shape({
    protein: PropTypes.string.isRequired,
    carbs: PropTypes.string.isRequired,
    fat: PropTypes.string.isRequired
  }).isRequired,
  allergens: PropTypes.arrayOf(PropTypes.string).isRequired,
  dietary: PropTypes.shape({
    isVegetarian: PropTypes.bool.isRequired,
    isVegan: PropTypes.bool.isRequired,
    isGlutenFree: PropTypes.bool.isRequired
  }).isRequired,
  pairings: PropTypes.arrayOf(PropTypes.string).isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.string).isRequired
});

export const CartItemPropType = PropTypes.shape({
  ...MenuItemPropType.shape,
  quantity: PropTypes.number.isRequired
});