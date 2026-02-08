import { Link, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearch({ strict: false }) as { orderId?: string };
  const orderId = searchParams.orderId;

  return (
    <div className="py-16">
      <div className="container-custom max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {orderId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono font-semibold">{orderId}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/my-orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/catalog">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
