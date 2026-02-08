import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ProductId } from '../../backend';
import { toast } from 'sonner';

// Local type definitions since OrderId and OrderItem are not exported from backend
export type OrderId = bigint;

export interface OrderItem {
  productId: ProductId;
  quantity: bigint;
  pricePerItem: bigint;
}

interface CartItem {
  productId: bigint;
  name: string;
  priceCents: number;
  quantity: number;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<OrderId, Error, CartItem[]>({
    mutationFn: async (cartItems: CartItem[]) => {
      if (!actor) throw new Error('Actor not available');

      const orderItems: OrderItem[] = cartItems.map((item) => ({
        productId: item.productId,
        quantity: BigInt(item.quantity),
        pricePerItem: BigInt(item.priceCents),
      }));

      // Backend doesn't have placeOrder method
      throw new Error('Place order functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
    },
  });
}
