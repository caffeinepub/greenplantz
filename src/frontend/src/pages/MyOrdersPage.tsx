import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetOrdersForUser } from '../hooks/orders/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuth from '../components/auth/RequireAuth';
import { Package } from 'lucide-react';

// Define order status type locally
type OrderStatus = {
  __kind__: 'placed' | 'shipped' | 'delivered' | 'cancelled';
};

function MyOrdersContent() {
  const { data: orders, isLoading } = useGetOrdersForUser();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground">Your order history will appear here</p>
      </div>
    );
  }

  const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "outline" => {
    switch (status.__kind__) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    return status.__kind__.charAt(0).toUpperCase() + status.__kind__.slice(1);
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id.toString()}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(Number(order.createdAt) / 1000000).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.products.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm">
                  <span>Product ID: {item.productId.toString()}</span>
                  <span className="text-muted-foreground">Qty: {item.quantity.toString()}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${(Number(item.pricePerItem) / 100).toFixed(2)} each
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">
                ${(Number(order.totalAmountCents) / 100).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <RequireAuth>
      <div className="py-8">
        <div className="container-custom max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <MyOrdersContent />
        </div>
      </div>
    </RequireAuth>
  );
}
