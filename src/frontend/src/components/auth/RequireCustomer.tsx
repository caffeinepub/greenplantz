import { ReactNode } from 'react';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuth from './RequireAuth';

interface RequireCustomerProps {
  children: ReactNode;
}

export default function RequireCustomer({ children }: RequireCustomerProps) {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading, isFetched } = useGetCallerRole();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <RequireAuth>{children}</RequireAuth>;
  }

  if (isLoading || !isFetched) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!role?.isCustomer) {
    return <AccessDeniedScreen message="Customer access is required to view this page." />;
  }

  return <>{children}</>;
}
