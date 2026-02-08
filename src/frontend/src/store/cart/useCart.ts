import { useContext } from 'react';
import { CartContext } from './CartProvider';
import type { CartContextType } from './types';

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
