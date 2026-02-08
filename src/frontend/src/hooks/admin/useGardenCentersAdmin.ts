import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { GardenCenter, GardenCenterId } from '../../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetGardenCenters() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GardenCenter[]>({
    queryKey: ['gardenCenters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGardenCenters();
    },
    enabled: !!actor && !actorFetching,
  });
}

interface AddGardenCenterMemberParams {
  gardenCenterId: GardenCenterId;
  memberPrincipal: Principal;
}

export function useAddGardenCenterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, AddGardenCenterMemberParams>({
    mutationFn: async (params: AddGardenCenterMemberParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGardenCenterMember(params.gardenCenterId, params.memberPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      toast.success('Team member added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });
}

interface RemoveGardenCenterMemberParams {
  gardenCenterId: GardenCenterId;
  memberPrincipal: Principal;
}

export function useRemoveGardenCenterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveGardenCenterMemberParams>({
    mutationFn: async (params: RemoveGardenCenterMemberParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeGardenCenterMember(params.gardenCenterId, params.memberPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      toast.success('Team member removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });
}

interface DisableGardenCenterMemberParams {
  gardenCenterId: GardenCenterId;
  memberPrincipal: Principal;
}

export function useDisableGardenCenterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, DisableGardenCenterMemberParams>({
    mutationFn: async (params: DisableGardenCenterMemberParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.disableGardenCenterMember(params.gardenCenterId, params.memberPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      toast.success('Team member disabled successfully');
    },
    onError: (error) => {
      toast.error(`Failed to disable team member: ${error.message}`);
    },
  });
}

interface EnableGardenCenterMemberParams {
  gardenCenterId: GardenCenterId;
  memberPrincipal: Principal;
}

export function useEnableGardenCenterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, EnableGardenCenterMemberParams>({
    mutationFn: async (params: EnableGardenCenterMemberParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.enableGardenCenterMember(params.gardenCenterId, params.memberPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      toast.success('Team member enabled successfully');
    },
    onError: (error) => {
      toast.error(`Failed to enable team member: ${error.message}`);
    },
  });
}

interface RemoveGardenCenterParams {
  gardenCenterId: GardenCenterId;
}

export function useRemoveGardenCenter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveGardenCenterParams>({
    mutationFn: async (params: RemoveGardenCenterParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeGardenCenter(params.gardenCenterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenters'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['gardenCenterProducts'] });
      toast.success('Nursery removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove nursery: ${error.message}`);
    },
  });
}
