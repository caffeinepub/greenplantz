import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetOrdersForUser } from '../hooks/orders/useOrders';
import RequireAuth from '../components/auth/RequireAuth';
import { Package } from 'lucide-react';
import { formatINR } from '../utils/money';

type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled';

function MyOrdersContent() {
  const { data: orders, isLoading } = useGetOrdersForUser();

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-4xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16">
        <div className="container-custom text-center">
          <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">Your order history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

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
                  <Badge variant={getStatusVariant(order.status.__kind__ as OrderStatus)}>
                    {getStatusLabel(order.status.__kind__ as OrderStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.products.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">Product #{item.productId.toString()}</span>
                        <span className="text-muted-foreground ml-2">× {item.quantity.toString()}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatINR(item.pricePerItem)} each
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatINR(order.totalAmountCents)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <RequireAuth>
      <MyOrdersContent />
    </RequireAuth>
  );
}
