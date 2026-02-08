import { useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import ProductCard from '../components/store/ProductCard';
import { useGetCategories } from '../hooks/storefront/useCategories';
import { useGetActiveProducts, useSearchProducts } from '../hooks/storefront/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function CatalogPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { category?: string };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.category || 'all');

  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: allProducts, isLoading: productsLoading } = useGetActiveProducts();
  const { data: searchResults, isLoading: searchLoading } = useSearchProducts(searchTerm);

  const displayProducts = useMemo(() => {
    let products = searchTerm ? searchResults : allProducts;
    
    if (!products) return [];
    
    if (selectedCategory !== 'all') {
      const categoryId = BigInt(selectedCategory);
      products = products.filter(p => p.categoryId === categoryId);
    }
    
    return products;
  }, [allProducts, searchResults, searchTerm, selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === 'all') {
      navigate({ to: '/catalog' });
    } else {
      navigate({ to: '/catalog', search: { category: value } });
    }
  };

  const isLoading = categoriesLoading || productsLoading || searchLoading;

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

        {/* Category Filter */}
        {!categoriesLoading && categories && (
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="mb-8">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All Products</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id.toString()} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
