export function createCartItem(menuItem, quantity) {
  return {
    ...menuItem,
    quantity
  };
}

export function calculateCartTotal(items) {
  return items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price.replace('$', ''));
    return total + (itemPrice * item.quantity);
  }, 0);
}

export function formatCartTotal(total) {
  return `$${total.toFixed(2)}`;
}