import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useGetCallerRole } from '../auth/useCallerRole';
import type { GardenCenterId } from '../../backend';
import { Principal } from '@dfinity/principal';

// Local type definition since GardenCenter is not exported from backend
export interface GardenCenter {
  id: GardenCenterId;
  name: string;
  location: string;
  teamMembers: Array<{
    principal: Principal;
    enabled: boolean;
  }>;
  enabled: boolean;
  createdAt: bigint;
}

export function useMyGardenCenter() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();

  const primaryGardenCenterId = role?.gardenCenterMemberships?.[0];

  return useQuery<GardenCenter | null>({
    queryKey: ['myGardenCenter', primaryGardenCenterId?.toString()],
    queryFn: async () => {
      // Backend doesn't have getGardenCenter method
      // Return a placeholder until backend is updated
      if (!actor || !primaryGardenCenterId) return null;
      
      // Temporary workaround: return a basic structure
      return {
        id: primaryGardenCenterId,
        name: 'My Garden Center',
        location: 'Location',
        teamMembers: [],
        enabled: true,
        createdAt: BigInt(Date.now()),
      };
    },
    enabled: !!actor && !actorFetching && !roleLoading && !!primaryGardenCenterId,
  });
}
