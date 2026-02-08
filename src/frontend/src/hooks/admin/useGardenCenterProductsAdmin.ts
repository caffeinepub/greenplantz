import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Product, GardenCenterId } from '../../backend';

export function useGardenCenterProductsAdmin(gardenCenterId: GardenCenterId, enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['gardenCenterProducts', gardenCenterId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getProductsForGardenCenter
      // Fallback: get all active products and filter by gardenCenterId
      const allProducts = await actor.getActiveProducts();
      return allProducts.filter((p) => p.gardenCenterId === gardenCenterId);
    },
    enabled: !!actor && !actorFetching && enabled,
  });
}
