import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Product, CategoryId } from '../../backend';

export function useGetActiveProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProductsForCategory(categoryId: CategoryId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsForCategory(categoryId);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
  });
}
