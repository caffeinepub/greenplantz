import { createContext, ReactNode, useState, useEffect, useMemo } from 'react';
import type { CartContextType, CartItem } from './types';
import { loadCart, saveCart, clearCartStorage } from './cartStorage';

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadedItems = loadCart();
    setItems(loadedItems);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveCart(items);
    }
  }, [items, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId.toString() === item.productId.toString()
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (item.quantity || 1),
        };
        return updated;
      }

      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId.toString() === productId.toString()
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: bigint) => {
    setItems((prev) =>
      prev.filter((item) => item.productId.toString() !== productId.toString())
    );
  };

  const clearCart = () => {
    setItems([]);
    clearCartStorage();
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [items]
  );

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
