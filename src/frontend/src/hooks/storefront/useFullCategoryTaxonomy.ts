import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { CategoryWithSubcategories } from '../../backend';

export function useGetFullCategoryTaxonomy() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CategoryWithSubcategories[]>({
    queryKey: ['categories', 'taxonomy'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFullCategoryTaxonomy();
    },
    enabled: !!actor && !actorFetching,
  });
}
