import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCreateGardenCenter } from '../../hooks/nursery/useCreateGardenCenter';
import RequireAuth from '../../components/auth/RequireAuth';
import AccessDeniedScreen from '../../components/auth/AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';

function NurseryPortalContent() {
  const navigate = useNavigate();
  const { data: role, isLoading, isFetched } = useGetCallerRole();
  const { mutate: createGardenCenter, isPending: isCreating } = useCreateGardenCenter();

  const [nurseryName, setNurseryName] = useState('');
  const [nurseryLocation, setNurseryLocation] = useState('');

  useEffect(() => {
    if (isFetched) {
      const hasGardenCenterMembership = role?.gardenCenterMemberships && role.gardenCenterMemberships.length > 0;
      if (hasGardenCenterMembership || role?.isPlatformAdmin) {
        navigate({ to: '/nursery/dashboard' });
      }
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

  const hasGardenCenterMembership = role?.gardenCenterMemberships && role.gardenCenterMemberships.length > 0;

  if (!hasGardenCenterMembership && !role?.isPlatformAdmin) {
    const handleRegisterNursery = () => {
      if (!nurseryName || !nurseryLocation) {
        toast.error('Please fill in all fields');
        return;
      }

      createGardenCenter(
        { name: nurseryName, location: nurseryLocation },
        {
          onSuccess: () => {
            toast.success('Nursery registered successfully!');
            navigate({ to: '/nursery/dashboard' });
          },
        }
      );
    };

    return (
      <div className="py-16">
        <div className="container-custom max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Register Your Nursery</CardTitle>
              <CardDescription>
                Create your garden center profile to start selling plants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nurseryName">Nursery Name</Label>
                  <Input
                    id="nurseryName"
                    value={nurseryName}
                    onChange={(e) => setNurseryName(e.target.value)}
                    placeholder="e.g., Green Thumb Garden Center"
                  />
                </div>
                <div>
                  <Label htmlFor="nurseryLocation">Location</Label>
                  <Input
                    id="nurseryLocation"
                    value={nurseryLocation}
                    onChange={(e) => setNurseryLocation(e.target.value)}
                    placeholder="e.g., 123 Main St, City, State"
                  />
                </div>
                <Button
                  onClick={handleRegisterNursery}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Registering...' : 'Register Nursery'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

export default function NurseryPortalPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <RequireAuth><div /></RequireAuth>;
  }

  return <NurseryPortalContent />;
}
