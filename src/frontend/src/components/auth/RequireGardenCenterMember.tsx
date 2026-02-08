import { ReactNode } from 'react';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuth from './RequireAuth';

interface RequireGardenCenterMemberProps {
  children: ReactNode;
}

export default function RequireGardenCenterMember({ children }: RequireGardenCenterMemberProps) {
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
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const hasGardenCenterMembership = role?.gardenCenterMemberships && role.gardenCenterMemberships.length > 0;

  if (!hasGardenCenterMembership && !role?.isPlatformAdmin) {
    return <AccessDeniedScreen message="You must be a member of a garden center to access this page." />;
  }

  return <>{children}</>;
}
