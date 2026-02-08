import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { OrderId, OrderItem } from '../../backend';
import { toast } from 'sonner';

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

      return actor.placeOrder(orderItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
    },
  });
}
