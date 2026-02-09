import { useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, ChevronDown, Filter, AlertCircle } from 'lucide-react';
import ProductCard from '../components/store/ProductCard';
import { useGetFullCategoryTaxonomy } from '../hooks/storefront/useFullCategoryTaxonomy';
import { useGetActiveProducts, useSearchProducts } from '../hooks/storefront/useProducts';
import { flattenTaxonomy, getDescendantCategoryIds } from '../utils/categoryTaxonomy';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryId } from '../backend';

export default function CatalogPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { category?: string };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    searchParams.category ? new Set([searchParams.category]) : new Set()
  );
  const [showFilters, setShowFilters] = useState(false);

  const { data: taxonomy, isLoading: taxonomyLoading } = useGetFullCategoryTaxonomy();
  const { data: allProducts, isLoading: productsLoading } = useGetActiveProducts();
  const { data: searchResults, isLoading: searchLoading } = useSearchProducts(searchTerm);

  const flatCategories = useMemo(() => {
    if (!taxonomy) return [];
    return flattenTaxonomy(taxonomy);
  }, [taxonomy]);

  const displayProducts = useMemo(() => {
    let products = searchTerm ? searchResults : allProducts;
    
    if (!products) return [];
    
    // Only apply category filtering if taxonomy is available and categories are selected
    if (selectedCategories.size > 0 && taxonomy && taxonomy.length > 0) {
      const allCategoryIds = new Set<string>();
      
      for (const categoryIdStr of selectedCategories) {
        const categoryId = BigInt(categoryIdStr);
        const descendants = getDescendantCategoryIds(categoryId, taxonomy);
        descendants.forEach((id) => allCategoryIds.add(id.toString()));
      }
      
      products = products.filter((p) => allCategoryIds.has(p.categoryId.toString()));
    }
    
    return products;
  }, [allProducts, searchResults, searchTerm, selectedCategories, taxonomy]);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);

    if (newSelected.size === 0) {
      navigate({ to: '/catalog' });
    } else if (newSelected.size === 1) {
      navigate({ to: '/catalog', search: { category: Array.from(newSelected)[0] } });
    }
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    navigate({ to: '/catalog' });
  };

  const isLoading = taxonomyLoading || productsLoading || searchLoading;

  // Group categories by parent for hierarchical display
  const categoryGroups = useMemo(() => {
    if (!taxonomy || taxonomy.length === 0) return [];
    
    return taxonomy.map((rootNode) => ({
      parent: rootNode.category,
      children: flattenTaxonomy([rootNode]).slice(1), // Skip the parent itself
    }));
  }, [taxonomy]);

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection of plants and garden supplies</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {selectedCategories.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full mb-4"
                >
                  Clear Filters
                </Button>
              )}

              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {taxonomyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !taxonomy || taxonomy.length === 0 ? (
                  <div className="flex items-start gap-2 p-3 border rounded-md bg-muted/50">
                    <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Categories are not available right now.
                    </p>
                  </div>
                ) : (
                  categoryGroups.map((group) => (
                    <Collapsible key={group.parent.id.toString()} defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
                        <span className="font-medium text-sm">{group.parent.name}</span>
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-2">
                        {/* Parent category checkbox */}
                        <div className="flex items-center space-x-2 pl-2">
                          <Checkbox
                            id={`cat-${group.parent.id}`}
                            checked={selectedCategories.has(group.parent.id.toString())}
                            onCheckedChange={() => handleCategoryToggle(group.parent.id.toString())}
                          />
                          <Label
                            htmlFor={`cat-${group.parent.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            All {group.parent.name}
                          </Label>
                        </div>

                        {/* Child categories */}
                        {group.children.map((item) => (
                          <div
                            key={item.category.id.toString()}
                            className="flex items-center space-x-2"
                            style={{ paddingLeft: `${(item.depth + 1) * 0.75}rem` }}
                          >
                            <Checkbox
                              id={`cat-${item.category.id}`}
                              checked={selectedCategories.has(item.category.id.toString())}
                              onCheckedChange={() => handleCategoryToggle(item.category.id.toString())}
                            />
                            <Label
                              htmlFor={`cat-${item.category.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {item.category.name}
                            </Label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'} found
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id.toString()} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
