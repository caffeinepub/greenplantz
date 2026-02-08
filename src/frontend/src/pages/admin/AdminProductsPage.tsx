import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useGetCategories } from '../../hooks/storefront/useCategories';
import { useAddProduct, useToggleProductActive, useInitializeSeedData } from '../../hooks/admin/useAdminProducts';
import { useGetActiveProducts } from '../../hooks/storefront/useProducts';
import { toast } from 'sonner';
import RequirePlatformAdmin from '../../components/auth/RequirePlatformAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Building2 } from 'lucide-react';

function AdminProductsContent() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: products, isLoading: productsLoading } = useGetActiveProducts();
  const { mutate: addProduct, isPending: isAdding } = useAddProduct();
  const { mutate: toggleActive } = useToggleProductActive();
  const { mutate: initializeSeed, isPending: isInitializing } = useInitializeSeedData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !categoryId || !price || !stock) {
      toast.error('Please fill in all fields');
      return;
    }

    const priceCents = Math.round(parseFloat(price) * 100);
    const stockNum = parseInt(stock);

    addProduct(
      {
        name,
        description,
        categoryId: BigInt(categoryId),
        priceCents: BigInt(priceCents),
        stock: BigInt(stockNum),
        gardenCenterId: BigInt(0),
      },
      {
        onSuccess: () => {
          toast.success('Product added successfully');
          setName('');
          setDescription('');
          setCategoryId('');
          setPrice('');
          setStock('');
        },
      }
    );
  };

  const handleToggleActive = (productId: bigint, currentActive: boolean) => {
    toggleActive(
      { productId, active: !currentActive },
      {
        onSuccess: () => {
          toast.success(`Product ${!currentActive ? 'activated' : 'deactivated'}`);
        },
      }
    );
  };

  return (
    <div className="py-8">
      <div className="container-custom max-w-6xl">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin - Product Management</h1>
            <p className="text-muted-foreground">Add and manage products in the catalog</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/nurseries">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Nurseries
              </Link>
            </Button>
            <Button
              onClick={() => initializeSeed()}
              disabled={isInitializing}
              variant="outline"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Seed Data'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Monstera Deliciosa"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  {categoriesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isAdding} className="w-full">
                  {isAdding ? 'Adding...' : 'Add Product'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id.toString()} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Label htmlFor={`active-${product.id}`} className="text-sm">
                            Active
                          </Label>
                          <Switch
                            id={`active-${product.id}`}
                            checked={product.active}
                            onCheckedChange={() => handleToggleActive(product.id, product.active)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>${(Number(product.priceCents) / 100).toFixed(2)}</span>
                        <span>Stock: {product.stock.toString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No products yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <RequirePlatformAdmin>
      <AdminProductsContent />
    </RequirePlatformAdmin>
  );
}
