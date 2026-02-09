import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { CallerRole } from '../../backend';

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CallerRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerRole();
      } catch (error) {
        console.error('Error fetching caller role:', error);
        // Return a default guest role on error instead of throwing
        return {
          isPlatformAdmin: false,
          isCustomer: false,
          gardenCenterMemberships: [],
        };
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { data: role, isLoading } = useGetCallerRole();

  return {
    data: role?.isPlatformAdmin ?? false,
    isLoading,
  };
}
