import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import RequireAuth from '../../components/auth/RequireAuth';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import PrincipalIdPanel from '../../components/auth/PrincipalIdPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function TeamPortalContent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading, isFetched, error } = useGetCallerRole();

  useEffect(() => {
    if (isFetched && role?.isPlatformAdmin) {
      navigate({ to: '/admin/nurseries' });
    }
  }, [isFetched, role, navigate]);

  const principalId = identity?.getPrincipal().toString();

  // Show loading state with Principal ID
  if (isLoading || !isFetched) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-2xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
          {principalId && (
            <div className="mt-8">
              <PrincipalIdPanel 
                principalId={principalId}
                title="Your Principal ID"
                description="Loading your access level..."
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state if role query failed
  if (error) {
    return (
      <div className="py-8">
        <div className="container-custom max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to verify your access permissions. Please try refreshing the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
          {principalId && (
            <PrincipalIdPanel 
              principalId={principalId}
              title="Your Principal ID"
              description="Share this with an admin if you need access."
            />
          )}
        </div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!role?.isPlatformAdmin) {
    return (
      <AccessDeniedScreen 
        message="Platform admin privileges are required to access the Team Portal." 
        principalId={principalId}
      />
    );
  }

  // This should not render as the useEffect will redirect
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
