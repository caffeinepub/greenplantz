import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useGetCallerRole } from '../auth/useCallerRole';
import type { GardenCenter } from '../../backend';

export function useMyGardenCenter() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();

  const primaryGardenCenterId = role?.gardenCenterMemberships?.[0];

  return useQuery<GardenCenter | null>({
    queryKey: ['myGardenCenter', primaryGardenCenterId?.toString()],
    queryFn: async () => {
      if (!actor || !primaryGardenCenterId) return null;
      
      try {
        // Call the real backend method
        const gardenCenter = await actor.getGardenCenterById(primaryGardenCenterId);
        return gardenCenter;
      } catch (error) {
        console.error('Failed to fetch garden center:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !roleLoading && !!primaryGardenCenterId,
    retry: false,
  });
}
