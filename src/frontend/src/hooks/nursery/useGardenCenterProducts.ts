import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Product, ProductId, CategoryId, GardenCenterId } from '../../backend';
import { toast } from 'sonner';

export function useGardenCenterProducts(gardenCenterId: GardenCenterId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['gardenCenterProducts', gardenCenterId?.toString()],
    queryFn: async () => {
      if (!actor || !gardenCenterId) return [];
      // Backend doesn't have getProductsForGardenCenter
      // Fallback: get all active products and filter by gardenCenterId
      const allProducts = await actor.getActiveProducts();
      return allProducts.filter((p) => p.gardenCenterId === gardenCenterId);
    },
    enabled: !!actor && !actorFetching && !!gardenCenterId,
  });
}

interface AddProductParams {
  name: string;
  description: string;
  categoryId: CategoryId;
  priceCents: bigint;
  stock: bigint;
  gardenCenterId: GardenCenterId;
  imageUrls: string[];
}

export function useAddGardenCenterProduct() {
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
        params.imageUrls
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenterProducts', variables.gardenCenterId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
}

interface UpdateProductParams {
  productId: ProductId;
  name: string;
  description: string;
  categoryId: CategoryId;
  priceCents: bigint;
  stock: bigint;
  imageUrls: string[];
}

export function useUpdateGardenCenterProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateProductParams>({
    mutationFn: async (params: UpdateProductParams) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have updateProduct method
      throw new Error('Update product functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenterProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

interface ToggleProductActiveParams {
  productId: ProductId;
  active: boolean;
}

export function useToggleGardenCenterProductActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleProductActiveParams>({
    mutationFn: async (params: ToggleProductActiveParams) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have toggleProductActive method
      throw new Error('Toggle product active functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gardenCenterProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error(`Failed to toggle product: ${error.message}`);
    },
  });
}
