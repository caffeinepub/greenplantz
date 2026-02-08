import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import RequireAuth from '../../components/auth/RequireAuth';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';

function CustomerPortalContent() {
  const navigate = useNavigate();
  const { data: role, isLoading, isFetched } = useGetCallerRole();

  useEffect(() => {
    if (isFetched && role?.isCustomer) {
      navigate({ to: '/catalog' });
    }
  }, [isFetched, role, navigate]);

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
    return <AccessDeniedScreen message="Customer access is required to view the Customer Portal." />;
  }

  return null;
}

export default function CustomerPortalPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <RequireAuth><div /></RequireAuth>;
  }

  return <CustomerPortalContent />;
}
