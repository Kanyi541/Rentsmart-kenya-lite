
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getGlobalStats, getAllOrganizations } from '@/lib/api/super-admin';
import type { GlobalStats, Organization } from '@/lib/types';
import { ShieldCheck, Users, Building, Banknote, PieChart, ExternalLink, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import withAuth from '@/components/auth/with-auth';

function SuperAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'deletion' | 'deactivation' | null>(null);

  const openActionModal = (orgId: string, type: 'deletion' | 'deactivation') => {
    setSelectedOrgId(orgId);
    setActionType(type);
    setActionModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedOrgId || !actionType) return;
    try {
      if (actionType === 'deletion') {
        await requestOrganizationDeletion(selectedOrgId);
        toast({ title: 'Deletion Requested', description: 'Organization deletion request sent.' });
      } else {
        await requestOrganizationDeactivation(selectedOrgId);
        toast({ title: 'Deactivation Requested', description: 'Organization deactivation request sent.' });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send request.' });
    } finally {
      setActionModalOpen(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [s, o] = await Promise.all([
          getGlobalStats(),
          getAllOrganizations()
        ]);
        setStats(s);
        setOrgs(o);
      } catch (error) {
        console.error("Failed to fetch global data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredOrgs = orgs.filter(o => 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <AppLayout>
          <div className="space-y-8">
              <div>
                  <h1 className="text-4xl font-black tracking-tight text-primary">Owner's Dashboard</h1>
                  <p className="text-muted-foreground">Global system health and organization management.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-t-4 border-t-blue-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                          <Banknote className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">KSh {stats?.totalRevenue.toLocaleString()}</div>}
                          <p className="text-xs text-muted-foreground">Combined from all payments</p>
                      </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-green-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Orgs</CardTitle>
                          <Building className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.totalActiveSubscriptions} / {stats?.totalOrgs}</div>}
                          <p className="text-xs text-muted-foreground">Organizations with active plans</p>
                      </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-purple-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats?.totalTenants.toLocaleString()}</div>}
                          <p className="text-xs text-muted-foreground">Across the entire system</p>
                      </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-orange-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Plan Mix</CardTitle>
                          <PieChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="flex gap-2 pt-1">
                           {loading ? <Skeleton className="h-8 w-full" /> : (
                              <>
                                  <Badge variant="outline" title="Starter">S: {stats?.planDistribution.Starter}</Badge>
                                  <Badge variant="outline" title="Growth">G: {stats?.planDistribution.Growth}</Badge>
                                  <Badge variant="outline" title="Scale">U: {stats?.planDistribution.Scale}</Badge>
                              </>
                           )}
                      </CardContent>
                  </Card>
              </div>

              <Card>
                  <CardHeader>
                      <CardTitle>Organization Directory</CardTitle>
                      <CardDescription>Monitor and manage all landlord organizations using your platform.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="relative mb-6">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder="Search by name or Org ID..."
                              className="pl-8 max-w-md"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Organization Name</TableHead>
                                  <TableHead>Plan</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Expires On</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {loading ? (
                                  Array.from({length: 5}).map((_, i) => (
                                      <TableRow key={i}>
                                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                          <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                      </TableRow>
                                  ))
                              ) : filteredOrgs.length === 0 ? (
                                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No organizations found.</TableCell></TableRow>
                              ) : (
                                  filteredOrgs.map(org => (
                                      <TableRow key={org.id}>
                                          <TableCell className="font-bold">{org.name}</TableCell>
                                          <TableCell>
                                              <Badge variant={org.plan === 'Scale' ? 'default' : 'secondary'}>{org.plan}</Badge>
                                          </TableCell>
                                          <TableCell>
                                              <Badge variant={org.subscriptionStatus === 'active' ? 'default' : 'destructive'} className={org.subscriptionStatus === 'active' ? 'bg-green-600' : ''}>
                                                  {org.subscriptionStatus.replace('_', ' ')}
                                              </Badge>
                                          </TableCell>
                                          <TableCell>
                                              {org.subscriptionEndDate ? format(new Date(org.subscriptionEndDate), 'PPP') : '---'}
                                          </TableCell>
                                          <TableCell className="text-right flex gap-2 justify-end">
                                            <button
                                              className="text-sm text-blue-600 hover:underline"
                                              onClick={() => openActionModal(org.id, 'deletion')}
                                            >
                                              Request Delete
                                            </button>
                                            <button
                                              className="text-sm text-green-600 hover:underline"
                                              onClick={() => openActionModal(org.id, 'deactivation')}
                                            >
                                              Request Deactivate
                                            </button>
                                          </TableCell>
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
          <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{actionType === 'deletion' ? 'Request Organization Deletion' : 'Request Organization Deactivation'}</DialogTitle>
                <DialogDescription>
                  Are you sure you want to {actionType === 'deletion' ? 'delete' : 'deactivate'} this organization? The super‑admin will be notified.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <button className="px-4 py-2 text-sm text-gray-600 hover:underline">Cancel</button>
                </DialogClose>
                <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Confirm
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </AppLayout>
  )
}

export default withAuth(SuperAdminDashboard);
