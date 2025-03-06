import React from 'react';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
      <p className="text-lg mb-2">Your cart is empty</p>
      <p className="text-sm">Add some delicious items to get started</p>
    </div>
  );
}