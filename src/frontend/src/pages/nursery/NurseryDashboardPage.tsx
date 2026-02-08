import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMyGardenCenter } from '../../hooks/nursery/useMyGardenCenter';
import { useUpdateGardenCenter } from '../../hooks/nursery/useUpdateGardenCenter';
import { useGardenCenterProducts, useAddGardenCenterProduct, useToggleGardenCenterProductActive } from '../../hooks/nursery/useGardenCenterProducts';
import { useGetCategories } from '../../hooks/storefront/useCategories';
import RequireGardenCenterMember from '../../components/auth/RequireGardenCenterMember';
import { toast } from 'sonner';
import { Building2, Package, Plus, X, Image as ImageIcon } from 'lucide-react';

function NurseryDashboardContent() {
  const { data: gardenCenter, isLoading: gcLoading } = useMyGardenCenter();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: products, isLoading: productsLoading } = useGardenCenterProducts(gardenCenter?.id);
  const { mutate: updateGardenCenter, isPending: isUpdating } = useUpdateGardenCenter();
  const { mutate: addProduct, isPending: isAdding } = useAddGardenCenterProduct();
  const { mutate: toggleActive } = useToggleGardenCenterProductActive();

  const [gcName, setGcName] = useState('');
  const [gcLocation, setGcLocation] = useState('');
  const [editingGc, setEditingGc] = useState(false);

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);

  const handleEditGardenCenter = () => {
    if (gardenCenter) {
      setGcName(gardenCenter.name);
      setGcLocation(gardenCenter.location);
      setEditingGc(true);
    }
  };

  const handleSaveGardenCenter = () => {
    if (!gardenCenter) return;

    if (!gcName || !gcLocation) {
      toast.error('Please fill in all fields');
      return;
    }

    updateGardenCenter(
      {
        gardenCenterId: gardenCenter.id,
        name: gcName,
        location: gcLocation,
      },
      {
        onSuccess: () => {
          setEditingGc(false);
        },
      }
    );
  };

  const handleAddImageUrl = () => {
    if (!currentImageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    if (productImageUrls.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setProductImageUrls([...productImageUrls, currentImageUrl]);
    setCurrentImageUrl('');
  };

  const handleRemoveImageUrl = (index: number) => {
    setProductImageUrls(productImageUrls.filter((_, i) => i !== index));
  };

  const handleAddProduct = () => {
    if (!gardenCenter) return;

    if (!productName || !productDescription || !productCategoryId || !productPrice || !productStock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceCents = Math.round(parseFloat(productPrice) * 100);
    const stockNum = parseInt(productStock);

    addProduct(
      {
        name: productName,
        description: productDescription,
        categoryId: BigInt(productCategoryId),
        priceCents: BigInt(priceCents),
        stock: BigInt(stockNum),
        gardenCenterId: gardenCenter.id,
        imageUrls: productImageUrls,
      },
      {
        onSuccess: () => {
          setProductName('');
          setProductDescription('');
          setProductCategoryId('');
          setProductPrice('');
          setProductStock('');
          setProductImageUrls([]);
          setCurrentImageUrl('');
          setAddProductDialogOpen(false);
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

  if (gcLoading) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!gardenCenter) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <Card>
            <CardHeader>
              <CardTitle>No Garden Center Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You are not associated with any garden center.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nursery Dashboard</h1>
          <p className="text-muted-foreground">Manage your garden center details and products</p>
        </div>

        <div className="space-y-8">
          {/* Garden Center Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Garden Center Details</CardTitle>
              </div>
              {!editingGc && (
                <Button onClick={handleEditGardenCenter} variant="outline" size="sm">
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingGc ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gcName">Name</Label>
                    <Input
                      id="gcName"
                      value={gcName}
                      onChange={(e) => setGcName(e.target.value)}
                      placeholder="Garden center name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gcLocation">Location</Label>
                    <Input
                      id="gcLocation"
                      value={gcLocation}
                      onChange={(e) => setGcLocation(e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveGardenCenter} disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={() => setEditingGc(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="font-medium">{gardenCenter.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <p className="font-medium">{gardenCenter.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Products</CardTitle>
              </div>
              <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Monstera Deliciosa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productDescription">Description</Label>
                      <Textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCategory">Category</Label>
                      {categoriesLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                          <SelectTrigger id="productCategory">
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
                        <Label htmlFor="productPrice">Price ($)</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          step="0.01"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productStock">Stock</Label>
                        <Input
                          id="productStock"
                          type="number"
                          value={productStock}
                          onChange={(e) => setProductStock(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Image URLs Section */}
                    <div className="space-y-3">
                      <Label>Product Images (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentImageUrl}
                          onChange={(e) => setCurrentImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddImageUrl}
                          variant="outline"
                          size="icon"
                          disabled={productImageUrls.length >= 5}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {productImageUrls.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {productImageUrls.length} image{productImageUrls.length !== 1 ? 's' : ''} added (max 5)
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {productImageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg border overflow-hidden bg-muted">
                                  <img
                                    src={url}
                                    alt={`Product preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center';
                                        fallback.innerHTML = '<div class="text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveImageUrl(index)}
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleAddProduct} disabled={isAdding} className="w-full">
                      {isAdding ? 'Adding...' : 'Add Product'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id.toString()} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        {product.imageUrls && product.imageUrls.length > 0 && (
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-lg border overflow-hidden bg-muted">
                              <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full flex items-center justify-center text-muted-foreground';
                                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
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
                            {product.imageUrls && product.imageUrls.length > 0 && (
                              <span className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                {product.imageUrls.length}
                              </span>
                            )}
                          </div>
                        </div>
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

export default function NurseryDashboardPage() {
  return (
    <RequireGardenCenterMember>
      <NurseryDashboardContent />
    </RequireGardenCenterMember>
  );
}
