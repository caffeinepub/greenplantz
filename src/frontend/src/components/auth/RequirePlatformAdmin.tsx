import { ReactNode } from 'react';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuth from './RequireAuth';

interface RequirePlatformAdminProps {
  children: ReactNode;
}

export default function RequirePlatformAdmin({ children }: RequirePlatformAdminProps) {
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
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!role?.isPlatformAdmin) {
    const principalId = identity?.getPrincipal().toString();
    return (
      <AccessDeniedScreen 
        message="Platform admin privileges are required to access this page." 
        principalId={principalId}
      />
    );
  }

  return <>{children}</>;
}
