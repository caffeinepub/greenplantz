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
import { formatINR } from '../utils/money';

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
              Please log in to complete your order.
            </AlertDescription>
          </Alert>
        )}

        <ProfileSetupDialog />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId.toString()} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatINR(item.priceCents)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatINR(item.priceCents * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatINR(totalPrice)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(totalPrice)}</span>
                </div>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={!isAuthenticated || isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
