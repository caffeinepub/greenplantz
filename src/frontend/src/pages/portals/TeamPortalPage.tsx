import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import RequireAuth from '../../components/auth/RequireAuth';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import PrincipalIdPanel from '../../components/auth/PrincipalIdPanel';
import { Skeleton } from '@/components/ui/skeleton';

function TeamPortalContent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading, isFetched } = useGetCallerRole();

  useEffect(() => {
    if (isFetched && role?.isPlatformAdmin) {
      navigate({ to: '/admin/nurseries' });
    }
  }, [isFetched, role, navigate]);

  if (isLoading || !isFetched) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-2xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
          {identity && (
            <div className="mt-8">
              <PrincipalIdPanel 
                principalId={identity.getPrincipal().toString()}
                title="Your Principal ID"
                description="Loading your access level..."
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!role?.isPlatformAdmin) {
    const principalId = identity?.getPrincipal().toString();
    return (
      <AccessDeniedScreen 
        message="Platform admin privileges are required to access the Team Portal." 
        principalId={principalId}
      />
    );
  }

  return null;
}

export default function TeamPortalPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <RequireAuth><div /></RequireAuth>;
  }

  return <TeamPortalContent />;
}
