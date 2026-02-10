import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ProductId, CategoryId, GardenCenterId } from '../../backend';
import { toast } from 'sonner';
import { normalizeErrorMessage } from '../../utils/errorMessage';

interface AddProductParams {
  name: string;
  description: string;
  categoryId: CategoryId;
  priceCents: bigint;
  stock: bigint;
  gardenCenterId: GardenCenterId;
}

interface ToggleProductActiveParams {
  productId: ProductId;
  active: boolean;
}

interface VerifyProductParams {
  productId: ProductId;
  verified: boolean;
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ProductId, Error, AddProductParams>({
    mutationFn: async (params: AddProductParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(
        params.name,
        params.description,
        params.categoryId,
        params.priceCents,
        params.stock,
        params.gardenCenterId,
        []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
}

export function useToggleProductActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleProductActiveParams>({
    mutationFn: async (params: ToggleProductActiveParams) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have toggleProductActive method
      throw new Error('Toggle product active functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error(`Failed to toggle product: ${error.message}`);
    },
  });
}

export function useVerifyProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, VerifyProductParams>({
    mutationFn: async (params: VerifyProductParams) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return await actor.verifyProduct(params.productId, params.verified);
      } catch (error) {
        const errorMessage = normalizeErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['gardenCenterProducts'] });
      toast.success(variables.verified ? 'Product verified successfully' : 'Product unverified');
    },
    onError: (error) => {
      const errorMessage = normalizeErrorMessage(error);
      toast.error(`Failed to update verification: ${errorMessage}`);
    },
  });
}

export function useInitializeSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeSeedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Seed data initialized successfully');
    },
    onError: (error) => {
      toast.error(`Failed to initialize seed data: ${error.message}`);
    },
  });
}
