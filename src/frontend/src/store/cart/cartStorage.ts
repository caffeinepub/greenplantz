import type { CartItem } from './types';

const CART_STORAGE_KEY = 'greenplantz_cart';
const CART_VERSION = 1;

interface StoredCart {
  version: number;
  items: CartItem[];
}

export function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed: StoredCart = JSON.parse(stored);
    
    if (parsed.version !== CART_VERSION) {
      return [];
    }

    return parsed.items.map(item => ({
      ...item,
      productId: BigInt(item.productId.toString()),
    }));
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    const toStore: StoredCart = {
      version: CART_VERSION,
      items: items.map(item => ({
        ...item,
        productId: item.productId,
      })),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
}

export function clearCartStorage(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart:', error);
  }
}
