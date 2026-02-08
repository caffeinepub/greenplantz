import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

// Define Order type locally since backend doesn't export it
interface Order {
  id: bigint;
  products: Array<{
    productId: bigint;
    quantity: bigint;
    pricePerItem: bigint;
  }>;
  totalAmountCents: bigint;
  createdAt: bigint;
  status: {
    __kind__: 'placed' | 'shipped' | 'delivered' | 'cancelled';
  };
}

export function useGetOrdersForUser() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', 'user'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getOrdersForUser method yet
      // Return empty array for now
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}
