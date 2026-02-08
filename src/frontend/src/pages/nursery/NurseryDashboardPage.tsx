import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMyGardenCenter } from '../../hooks/nursery/useMyGardenCenter';
import { useUpdateGardenCenter } from '../../hooks/nursery/useUpdateGardenCenter';
import { useGardenCenterProducts, useAddGardenCenterProduct, useToggleGardenCenterProductActive } from '../../hooks/nursery/useGardenCenterProducts';
import { useGetFullCategoryTaxonomy } from '../../hooks/storefront/useFullCategoryTaxonomy';
import { getLeafCategories, flattenTaxonomy } from '../../utils/categoryTaxonomy';
import RequireGardenCenterMember from '../../components/auth/RequireGardenCenterMember';
import { toast } from 'sonner';
import { Building2, Package, Plus, X, Image as ImageIcon } from 'lucide-react';

function NurseryDashboardContent() {
  const { data: gardenCenter, isLoading: gcLoading } = useMyGardenCenter();
  const { data: taxonomy, isLoading: taxonomyLoading } = useGetFullCategoryTaxonomy();
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

  // Get leaf categories for product assignment
  const leafCategories = taxonomy ? getLeafCategories(taxonomy) : [];

  // Group categories by parent for hierarchical display in select
  const categoryGroups = taxonomy
    ? taxonomy.map((rootNode) => ({
        parent: rootNode.category,
        children: flattenTaxonomy([rootNode]).filter((item) => item.isLeaf),
      }))
    : [];

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
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productDescription">Description *</Label>
                      <Textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="productCategory">Category *</Label>
                      {taxonomyLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                          <SelectTrigger id="productCategory">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryGroups.map((group) => (
                              <SelectGroup key={group.parent.id.toString()}>
                                <SelectLabel>{group.parent.name}</SelectLabel>
                                {group.children.map((item) => (
                                  <SelectItem
                                    key={item.category.id.toString()}
                                    value={item.category.id.toString()}
                                  >
                                    {item.indentLabel}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="productPrice">Price (₹) *</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productStock">Stock *</Label>
                        <Input
                          id="productStock"
                          type="number"
                          min="0"
                          value={productStock}
                          onChange={(e) => setProductStock(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Product Images (Optional)</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={currentImageUrl}
                            onChange={(e) => setCurrentImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                          />
                          <Button
                            type="button"
                            onClick={handleAddImageUrl}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {productImageUrls.length > 0 && (
                          <div className="space-y-2">
                            {productImageUrls.map((url, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                    }}
                                  />
                                </div>
                                <span className="flex-1 text-sm truncate">{url}</span>
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveImageUrl(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddProductDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct} disabled={isAdding}>
                        {isAdding ? 'Adding...' : 'Add Product'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products yet. Add your first product to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id.toString()}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                        {product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">₹{(Number(product.priceCents) / 100).toFixed(2)}</span>
                          <span className="text-muted-foreground">Stock: {product.stock.toString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${product.id}`} className="text-sm">
                          {product.active ? 'Active' : 'Inactive'}
                        </Label>
                        <Switch
                          id={`active-${product.id}`}
                          checked={product.active}
                          onCheckedChange={() => handleToggleActive(product.id, product.active)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
