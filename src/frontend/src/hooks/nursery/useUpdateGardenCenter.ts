import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { GardenCenterId } from '../../backend';
import { toast } from 'sonner';

interface UpdateGardenCenterParams {
  gardenCenterId: GardenCenterId;
  name: string;
  location: string;
}

export function useUpdateGardenCenter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateGardenCenterParams>({
    mutationFn: async (params: UpdateGardenCenterParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGardenCenter(params.gardenCenterId, params.name, params.location);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myGardenCenter', variables.gardenCenterId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      toast.success('Garden center updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update garden center: ${error.message}`);
    },
  });
}
