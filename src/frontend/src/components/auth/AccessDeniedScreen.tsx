import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import PrincipalIdPanel from './PrincipalIdPanel';

interface AccessDeniedScreenProps {
  message?: string;
  principalId?: string;
}

export default function AccessDeniedScreen({ message, principalId }: AccessDeniedScreenProps) {
  const defaultMessage = "You don't have permission to access this page.";
  
  return (
    <div className="py-16">
      <div className="container-custom max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {message || defaultMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {principalId && (
              <PrincipalIdPanel principalId={principalId} />
            )}
            <Button asChild className="w-full">
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
