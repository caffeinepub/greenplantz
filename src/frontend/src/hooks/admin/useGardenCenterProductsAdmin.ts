import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Product, GardenCenterId } from '../../backend';

export function useGardenCenterProductsAdmin(gardenCenterId: GardenCenterId, enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['gardenCenterProducts', gardenCenterId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsForGardenCenter(gardenCenterId);
    },
    enabled: !!actor && !actorFetching && enabled,
  });
}
