import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './store/cart/CartProvider';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminNurseriesPage from './pages/admin/AdminNurseriesPage';
import TeamPortalPage from './pages/portals/TeamPortalPage';
import NurseryPortalPage from './pages/portals/NurseryPortalPage';
import CustomerPortalPage from './pages/portals/CustomerPortalPage';
import NurseryDashboardPage from './pages/nursery/NurseryDashboardPage';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation',
  component: OrderConfirmationPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-orders',
  component: MyOrdersPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminProductsPage,
});

const adminNurseriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/nurseries',
  component: AdminNurseriesPage,
});

const teamPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/team',
  component: TeamPortalPage,
});

const nurseryPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/nursery',
  component: NurseryPortalPage,
});

const customerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/customer',
  component: CustomerPortalPage,
});

const nurseryDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nursery/dashboard',
  component: NurseryDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  myOrdersRoute,
  adminRoute,
  adminNurseriesRoute,
  teamPortalRoute,
  nurseryPortalRoute,
  customerPortalRoute,
  nurseryDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </ThemeProvider>
  );
}
