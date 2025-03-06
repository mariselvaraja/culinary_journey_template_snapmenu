export function formatPrice(amount) {
  if (amount === undefined || amount === null) {
    console.warn('Price is undefined or null');
    return '$0.00';
  }

  // Handle string prices (e.g., "14", "120")
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(price)) {
    console.warn(`Invalid price: ${amount}`);
    return '$0.00';
  }

  // Log the price formatting for debugging
  console.log('Formatting price:', amount, '(type:', typeof amount, ') to:', `$${price.toFixed(2)}`);
  return `$${price.toFixed(2)}`;
}
