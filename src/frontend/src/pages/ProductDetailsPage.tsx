import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProduct } from '../hooks/storefront/useProduct';
import { useCart } from '../store/cart/useCart';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../utils/money';

export default function ProductDetailsPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProduct(BigInt(productId));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product.id,
      name: product.name,
      priceCents: Number(product.priceCents),
      quantity,
    });

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-6xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate({ to: '/catalog' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const hasImages = product.imageUrls && product.imageUrls.length > 0;
  const currentImage = hasImages ? product.imageUrls[selectedImageIndex] : null;

  return (
    <div className="py-8">
      <div className="container-custom max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/catalog' })}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center text-muted-foreground';
                          fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <Package className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Gallery */}
            {hasImages && product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-muted text-muted-foreground';
                          fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl font-semibold text-primary">
                {formatINR(product.priceCents)}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability:</span>
                    {Number(product.stock) > 0 ? (
                      <Badge variant="default">In Stock ({product.stock.toString()})</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>

                  {Number(product.stock) > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button onClick={handleAddToCart} className="w-full" size="lg">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
