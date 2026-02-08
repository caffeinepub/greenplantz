import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGrantAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      await actor.grantAdminAccess(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      toast.success('Admin access granted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to grant admin access: ${error.message}`);
    },
  });
}

export function useRevokeAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      await actor.revokeAccess(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      toast.success('Access revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke access: ${error.message}`);
    },
  });
}
