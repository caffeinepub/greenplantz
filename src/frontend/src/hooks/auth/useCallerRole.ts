import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { CallerRole } from '../../backend';

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CallerRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
