import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useGetGardenCenters, useRemoveGardenCenterMember, useDisableGardenCenterMember, useEnableGardenCenterMember, useRemoveGardenCenter } from '../../hooks/admin/useGardenCentersAdmin';
import { useGardenCenterProductsAdmin } from '../../hooks/admin/useGardenCenterProductsAdmin';
import RequirePlatformAdmin from '../../components/auth/RequirePlatformAdmin';
import { Building2, Users, UserX, UserCheck, Trash2, ChevronDown, Package, Image as ImageIcon } from 'lucide-react';
import type { GardenCenterId } from '../../backend';
import { Principal } from '@dfinity/principal';

function AdminNurseriesContent() {
  const { data: gardenCenters, isLoading } = useGetGardenCenters();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveGardenCenterMember();
  const { mutate: disableMember, isPending: isDisabling } = useDisableGardenCenterMember();
  const { mutate: enableMember, isPending: isEnabling } = useEnableGardenCenterMember();
  const { mutate: removeGardenCenter, isPending: isRemovingGC } = useRemoveGardenCenter();

  const [expandedNurseries, setExpandedNurseries] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'remove' | 'disable' | 'enable' | 'removeNursery';
    gardenCenterId: GardenCenterId | null;
    memberPrincipal: Principal | null;
  }>({
    open: false,
    action: 'remove',
    gardenCenterId: null,
    memberPrincipal: null,
  });

  const toggleNurseryExpanded = (id: string) => {
    const newExpanded = new Set(expandedNurseries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNurseries(newExpanded);
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.gardenCenterId) return;

    if (confirmDialog.action === 'removeNursery') {
      removeGardenCenter(
        { gardenCenterId: confirmDialog.gardenCenterId },
        {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: 'remove', gardenCenterId: null, memberPrincipal: null });
          },
        }
      );
      return;
    }

    if (!confirmDialog.memberPrincipal) return;

    const params = {
      gardenCenterId: confirmDialog.gardenCenterId,
      memberPrincipal: confirmDialog.memberPrincipal,
    };

    switch (confirmDialog.action) {
      case 'remove':
        removeMember(params, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: 'remove', gardenCenterId: null, memberPrincipal: null });
          },
        });
        break;
      case 'disable':
        disableMember(params, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: 'disable', gardenCenterId: null, memberPrincipal: null });
          },
        });
        break;
      case 'enable':
        enableMember(params, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: 'enable', gardenCenterId: null, memberPrincipal: null });
          },
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeGardenCenters = gardenCenters?.filter((gc) => gc.enabled) || [];

  return (
    <div className="py-8">
      <div className="container-custom max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nursery Management</h1>
          <p className="text-muted-foreground">Manage garden centers and their team members</p>
        </div>

        {activeGardenCenters.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No garden centers registered yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeGardenCenters.map((gardenCenter) => (
              <Card key={gardenCenter.id.toString()}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>{gardenCenter.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{gardenCenter.location}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          action: 'removeNursery',
                          gardenCenterId: gardenCenter.id,
                          memberPrincipal: null,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Nursery
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Members Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-sm">Team Members</h4>
                      <Badge variant="secondary">{gardenCenter.teamMembers.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {gardenCenter.teamMembers.map((member) => (
                        <div
                          key={member.principal.toString()}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {member.principal.toString().slice(0, 20)}...
                            </code>
                            <Badge variant={member.enabled ? 'default' : 'secondary'}>
                              {member.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {member.enabled ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    action: 'disable',
                                    gardenCenterId: gardenCenter.id,
                                    memberPrincipal: member.principal,
                                  })
                                }
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Disable
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    action: 'enable',
                                    gardenCenterId: gardenCenter.id,
                                    memberPrincipal: member.principal,
                                  })
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Enable
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: 'remove',
                                  gardenCenterId: gardenCenter.id,
                                  memberPrincipal: member.principal,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Products Section */}
                  <ProductsSection gardenCenterId={gardenCenter.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === 'removeNursery' && 'Remove Nursery'}
                {confirmDialog.action === 'remove' && 'Remove Team Member'}
                {confirmDialog.action === 'disable' && 'Disable Team Member'}
                {confirmDialog.action === 'enable' && 'Enable Team Member'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.action === 'removeNursery' &&
                  'Are you sure you want to remove this nursery? This will disable the garden center and its products will no longer appear in the store.'}
                {confirmDialog.action === 'remove' &&
                  'Are you sure you want to remove this team member? This action cannot be undone.'}
                {confirmDialog.action === 'disable' &&
                  'Are you sure you want to disable this team member? They will lose access to the nursery dashboard.'}
                {confirmDialog.action === 'enable' &&
                  'Are you sure you want to enable this team member? They will regain access to the nursery dashboard.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                disabled={isRemoving || isDisabling || isEnabling || isRemovingGC}
                className={confirmDialog.action === 'remove' || confirmDialog.action === 'removeNursery' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {(isRemoving || isDisabling || isEnabling || isRemovingGC) ? 'Processing...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function ProductsSection({ gardenCenterId }: { gardenCenterId: GardenCenterId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: products, isLoading } = useGardenCenterProductsAdmin(gardenCenterId, isExpanded);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Products</h4>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id.toString()} className="border rounded-lg p-3">
                <div className="flex gap-3">
                  {product.imageUrls && product.imageUrls.length > 0 && (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg border overflow-hidden bg-muted">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center text-muted-foreground';
                              fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-sm">{product.name}</h5>
                      <Badge variant={product.active ? 'default' : 'secondary'}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {product.description}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                      <span>${(Number(product.priceCents) / 100).toFixed(2)}</span>
                      <span>Stock: {product.stock.toString()}</span>
                      {product.imageUrls && product.imageUrls.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {product.imageUrls.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No products added yet</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdminNurseriesPage() {
  return (
    <RequirePlatformAdmin>
      <AdminNurseriesContent />
    </RequirePlatformAdmin>
  );
}
