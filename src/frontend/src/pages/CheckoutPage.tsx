import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../store/cart/useCart';
import { usePlaceOrder } from '../hooks/orders/usePlaceOrder';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { mutate: placeOrder, isPending } = usePlaceOrder();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (items.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  const handlePlaceOrder = () => {
    placeOrder(items, {
      onSuccess: (orderId) => {
        clearCart();
        navigate({ 
          to: '/order-confirmation',
          search: { orderId: orderId.toString() }
        });
      },
    });
  };

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to place your order and track it later.
            </AlertDescription>
          </Alert>
        )}

        <ProfileSetupDialog />

        <div className="grid gap-8">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.productId.toString()} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${(item.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${(totalPrice / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Place Order */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/cart' })}
              className="flex-1"
            >
              Back to Cart
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isPending || !isAuthenticated}
              className="flex-1"
              size="lg"
            >
              {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
