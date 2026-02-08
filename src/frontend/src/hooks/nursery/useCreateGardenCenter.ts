import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { GardenCenterId } from '../../backend';
import { toast } from 'sonner';

interface CreateGardenCenterParams {
  name: string;
  location: string;
}

export function useCreateGardenCenter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<GardenCenterId, Error, CreateGardenCenterParams>({
    mutationFn: async (params: CreateGardenCenterParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGardenCenter(params.name, params.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      queryClient.invalidateQueries({ queryKey: ['myGardenCenter'] });
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
    },
    onError: (error) => {
      toast.error(`Failed to create garden center: ${error.message}`);
    },
  });
}
