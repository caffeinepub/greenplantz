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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useMyGardenCenter } from '../../hooks/nursery/useMyGardenCenter';
import { useUpdateGardenCenter } from '../../hooks/nursery/useUpdateGardenCenter';
import { useGardenCenterProducts, useAddGardenCenterProduct, useToggleGardenCenterProductActive, useUpdateProductStock } from '../../hooks/nursery/useGardenCenterProducts';
import { useGetFullCategoryTaxonomy } from '../../hooks/storefront/useFullCategoryTaxonomy';
import { getLeafCategories, flattenTaxonomy } from '../../utils/categoryTaxonomy';
import RequireGardenCenterMember from '../../components/auth/RequireGardenCenterMember';
import { toast } from 'sonner';
import { Building2, Package, Plus, X, Image as ImageIcon, AlertCircle, CheckCircle2, Clock, Edit2, Save } from 'lucide-react';
import { normalizeErrorMessage } from '../../utils/errorMessage';
import { formatINR } from '../../utils/money';

function NurseryDashboardContent() {
  const { data: gardenCenter, isLoading: gcLoading, error: gcError } = useMyGardenCenter();
  const { data: taxonomy, isLoading: taxonomyLoading } = useGetFullCategoryTaxonomy();
  const { data: products, isLoading: productsLoading } = useGardenCenterProducts(gardenCenter?.id);
  const { mutate: updateGardenCenter, isPending: isUpdating } = useUpdateGardenCenter();
  const { mutate: addProduct, isPending: isAdding } = useAddGardenCenterProduct();
  const { mutate: toggleActive } = useToggleGardenCenterProductActive();
  const { mutate: updateStock, isPending: isUpdatingStock } = useUpdateProductStock();

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

  // Stock editing state
  const [editingStockId, setEditingStockId] = useState<bigint | null>(null);
  const [editingStockValue, setEditingStockValue] = useState('');

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
    if (!gardenCenter) {
      toast.error('Garden center information is not available');
      return;
    }

    // Category is now optional - only validate required fields
    if (!productName || !productDescription || !productPrice || !productStock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceCents = Math.round(parseFloat(productPrice) * 100);
    const stockNum = parseInt(productStock);

    if (isNaN(priceCents) || priceCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // Use categoryId 0 (Uncategorized) if no category is selected
    const categoryId = productCategoryId ? BigInt(productCategoryId) : BigInt(0);

    addProduct(
      {
        name: productName,
        description: productDescription,
        categoryId,
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

  const handleStartEditStock = (productId: bigint, currentStock: bigint) => {
    setEditingStockId(productId);
    setEditingStockValue(currentStock.toString());
  };

  const handleSaveStock = (productId: bigint) => {
    const newStock = parseInt(editingStockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    updateStock(
      { productId, newStock: BigInt(newStock) },
      {
        onSuccess: () => {
          setEditingStockId(null);
          setEditingStockValue('');
        },
      }
    );
  };

  const handleCancelEditStock = () => {
    setEditingStockId(null);
    setEditingStockValue('');
  };

  if (gcLoading) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-6xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (gcError || !gardenCenter) {
    return (
      <div className="py-16">
        <div className="container-custom text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Garden Center</h2>
          <p className="text-muted-foreground mb-4">
            {gcError ? normalizeErrorMessage(gcError) : 'Garden center not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nursery Dashboard</h1>
          <p className="text-muted-foreground">Manage your garden center and products</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Garden Center Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Garden Center Details
                </CardTitle>
                {!editingGc ? (
                  <Button variant="outline" size="sm" onClick={handleEditGardenCenter}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSaveGardenCenter} disabled={isUpdating}>
                    <Save className="h-4 w-4 mr-1" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingGc ? (
                <>
                  <div>
                    <Label htmlFor="gc-name">Name</Label>
                    <Input
                      id="gc-name"
                      value={gcName}
                      onChange={(e) => setGcName(e.target.value)}
                      placeholder="Garden center name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-location">Location</Label>
                    <Input
                      id="gc-location"
                      value={gcLocation}
                      onChange={(e) => setGcLocation(e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{gardenCenter.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{gardenCenter.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Team Members</Label>
                    <p className="font-medium">{gardenCenter.teamMembers.length}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Products</span>
                    <span className="text-2xl font-bold">{products?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Products</span>
                    <span className="text-2xl font-bold">
                      {products?.filter((p) => p.active).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Verified Products</span>
                    <span className="text-2xl font-bold">
                      {products?.filter((p) => p.verified).length || 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
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
                      <Label htmlFor="product-name">Product Name *</Label>
                      <Input
                        id="product-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Monstera Deliciosa"
                      />
                    </div>

                    <div>
                      <Label htmlFor="product-description">Description *</Label>
                      <Textarea
                        id="product-description"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="product-category">Category (Optional)</Label>
                      {taxonomyLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                          <SelectTrigger id="product-category">
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryGroups.map((group) => (
                              <SelectGroup key={group.parent.id.toString()}>
                                <SelectLabel>{group.parent.name}</SelectLabel>
                                {group.children.map((cat) => (
                                  <SelectItem key={cat.category.id.toString()} value={cat.category.id.toString()}>
                                    {cat.category.name}
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
                        <Label htmlFor="product-price">Price (₹) *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-stock">Stock *</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          value={productStock}
                          onChange={(e) => setProductStock(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Product Images (Optional, max 5)</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={currentImageUrl}
                          onChange={(e) => setCurrentImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <Button type="button" onClick={handleAddImageUrl} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {productImageUrls.length > 0 && (
                        <div className="space-y-2">
                          {productImageUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate flex-1">{url}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveImageUrl(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button onClick={handleAddProduct} disabled={isAdding} className="w-full">
                      {isAdding ? 'Adding...' : 'Add Product'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id.toString()} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          {product.verified ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Unverified
                            </Badge>
                          )}
                        </div>
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

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="font-mono">SKU: {product.sku}</span>
                      <span>{formatINR(product.priceCents)}</span>
                      <div className="flex items-center gap-2">
                        <span>Stock:</span>
                        {editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              className="h-7 w-20 text-sm"
                              disabled={!product.verified}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => handleSaveStock(product.id)}
                              disabled={isUpdatingStock || !product.verified}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={handleCancelEditStock}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span>{product.stock.toString()}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => handleStartEditStock(product.id, product.stock)}
                              disabled={!product.verified}
                              title={!product.verified ? 'Product must be verified before updating stock' : 'Edit stock'}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!product.verified && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          This product must be verified by the GreenPlantz team before you can update stock quantities.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={() => setAddProductDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
