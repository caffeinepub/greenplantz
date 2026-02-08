export interface CartItem {
  productId: bigint;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartActions {
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  removeFromCart: (productId: bigint) => void;
  clearCart: () => void;
}

export type CartContextType = CartState & CartActions;
