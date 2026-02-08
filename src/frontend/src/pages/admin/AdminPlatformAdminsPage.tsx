import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, UserMinus, Shield } from 'lucide-react';
import RequirePlatformAdmin from '../../components/auth/RequirePlatformAdmin';
import { useGrantAdminAccess, useRevokeAccess } from '../../hooks/admin/usePlatformAdminAllowlist';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

function AdminPlatformAdminsContent() {
  const [addPrincipalId, setAddPrincipalId] = useState('');
  const [removePrincipalId, setRemovePrincipalId] = useState('');
  const [addError, setAddError] = useState('');
  const [removeError, setRemoveError] = useState('');

  const grantAdminMutation = useGrantAdminAccess();
  const revokeAccessMutation = useRevokeAccess();

  const validatePrincipal = (principalId: string): boolean => {
    if (!principalId.trim()) {
      return false;
    }
    try {
      Principal.fromText(principalId);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddAdmin = async () => {
    setAddError('');
    
    if (!addPrincipalId.trim()) {
      setAddError('Principal ID is required');
      return;
    }

    if (!validatePrincipal(addPrincipalId)) {
      setAddError('Invalid Principal ID format');
      return;
    }

    try {
      await grantAdminMutation.mutateAsync(addPrincipalId);
      setAddPrincipalId('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRemoveAdmin = async () => {
    setRemoveError('');
    
    if (!removePrincipalId.trim()) {
      setRemoveError('Principal ID is required');
      return;
    }

    if (!validatePrincipal(removePrincipalId)) {
      setRemoveError('Invalid Principal ID format');
      return;
    }

    try {
      await revokeAccessMutation.mutateAsync(removePrincipalId);
      setRemovePrincipalId('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Platform Admin Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage platform administrators by adding or removing Principal IDs from the admin allowlist.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Admin Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <CardTitle>Add Platform Admin</CardTitle>
              </div>
              <CardDescription>
                Grant platform admin access to a user by their Principal ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-principal">Principal ID</Label>
                <Input
                  id="add-principal"
                  placeholder="Enter Principal ID"
                  value={addPrincipalId}
                  onChange={(e) => {
                    setAddPrincipalId(e.target.value);
                    setAddError('');
                  }}
                  className={addError ? 'border-destructive' : ''}
                />
                {addError && (
                  <p className="text-sm text-destructive">{addError}</p>
                )}
              </div>
              <Button
                onClick={handleAddAdmin}
                disabled={grantAdminMutation.isPending}
                className="w-full"
              >
                {grantAdminMutation.isPending ? 'Adding...' : 'Add Admin'}
              </Button>
            </CardContent>
          </Card>

          {/* Remove Admin Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-destructive" />
                <CardTitle>Remove Platform Admin</CardTitle>
              </div>
              <CardDescription>
                Revoke platform admin access from a user by their Principal ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remove-principal">Principal ID</Label>
                <Input
                  id="remove-principal"
                  placeholder="Enter Principal ID"
                  value={removePrincipalId}
                  onChange={(e) => {
                    setRemovePrincipalId(e.target.value);
                    setRemoveError('');
                  }}
                  className={removeError ? 'border-destructive' : ''}
                />
                {removeError && (
                  <p className="text-sm text-destructive">{removeError}</p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={revokeAccessMutation.isPending || !removePrincipalId.trim()}
                    className="w-full"
                  >
                    {revokeAccessMutation.isPending ? 'Removing...' : 'Remove Admin'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke platform admin access for this Principal ID. The user will no longer be able to access admin features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemoveAdmin}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove Admin
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Principal IDs are unique identifiers from Internet Identity authentication</p>
            <p>• Users must be authenticated to see their Principal ID on the Team Portal page</p>
            <p>• After adding a Principal ID, that user will have full platform admin access</p>
            <p>• Removing a Principal ID will immediately revoke all admin privileges</p>
            <p>• Be careful when managing admin access - only grant to trusted users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPlatformAdminsPage() {
  return (
    <RequirePlatformAdmin>
      <AdminPlatformAdminsContent />
    </RequirePlatformAdmin>
  );
}
