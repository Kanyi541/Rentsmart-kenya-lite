
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getTenantById, updateTenant } from '@/lib/api/tenants';
import type { Tenant, Announcement } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { User, Phone, Mail, Home, KeyRound, Calendar, BadgeDollarSign, UserCheck, ShieldCheck, Pencil, Wrench, Megaphone } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Button } from './ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { EditTenantForm } from './edit-tenant-form';
import { useToast } from '@/hooks/use-toast';
import { updateTenantSchema } from '@/lib/schemas';
import { z } from 'zod';
import { getAnnouncements } from '@/lib/api/announcements';

// Demo Data
const demoTenant: Tenant = {
    id: 'demotenant',
    firstName: 'Demo',
    secondName: 'Tenant',
    email: 'tenant@demo.com',
    phone: '0700123123',
    idNumber: '12345678',
    gender: 'Female',
    maritalStatus: 'Single',
    rentalId: 'demo1',
    roomId: 'r2',
    rentalName: 'Demo Heights',
    roomNumber: 'A102',
    rent: 15000,
    nextPaymentDue: '2024-08-01',
    createdAt: new Date().toISOString(),
    nextOfKinName: 'Demo Next of Kin',
    nextOfKinPhone: '0700456456',
    nextOfKinRelationship: 'Sibling',
};

const demoAnnouncements: Announcement[] = [
    { id: '1', title: 'Water Maintenance Schedule', content: 'Please note that the water will be shut off for maintenance on Friday from 10 AM to 2 PM.', createdAt: new Date(Date.now() - 86400000).toISOString() },
];


export function ClientDashboard() {
    const { user, isDemoUser } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { toast } = useToast();

    async function fetchDashboardData() {
        if (!user) return;
        setLoading(true);

        if (isDemoUser) {
            const storedTenant = localStorage.getItem('demoTenant');
            setTenant(storedTenant ? JSON.parse(storedTenant) : demoTenant);
            const storedAnnouncements = localStorage.getItem('demoAnnouncements');
            setAnnouncements(storedAnnouncements ? JSON.parse(storedAnnouncements) : demoAnnouncements);
            setLoading(false);
            return;
        }

        try {
            const [tenantData, announcementsData] = await Promise.all([
                getTenantById(user.uid),
                getAnnouncements()
            ]);
            setTenant(tenantData);
            setAnnouncements(announcementsData);
        } catch (error) {
            console.error("Failed to fetch tenant data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, [user, isDemoUser]);

    const handleUpdateTenant = async (data: z.infer<typeof updateTenantSchema>) => {
        if (!user) return;
        if (isDemoUser) {
            const updatedTenant = { ...tenant, ...data };
            setTenant(updatedTenant as Tenant);
            localStorage.setItem('demoTenant', JSON.stringify(updatedTenant));
            toast({ title: 'Demo Mode', description: 'Your details have been updated in local storage.' });
            setIsEditDialogOpen(false);
            return;
        }
        try {
            await updateTenant(user.uid, data);
            toast({
                title: 'Details Updated!',
                description: 'Your personal information has been successfully updated.'
            });
            setIsEditDialogOpen(false);
            await fetchDashboardData(); // Re-fetch data to show the update
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'An unexpected error occurred.'
            });
        }
    };
    
    if (loading) {
        return <DashboardSkeleton />
    }

    if (!tenant) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load tenant details. It's possible your registration is incomplete. Please contact support.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const isPaymentDue = tenant.nextPaymentDue && new Date(tenant.nextPaymentDue) < new Date();
    const deposit = tenant.rent ? tenant.rent / 2 : 0;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {tenant.firstName}!</h1>
                <p className="text-muted-foreground">Here is a summary of your tenancy details and payments.</p>
            </div>

            {announcements.length > 0 && (
                 <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/50 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                            <Megaphone />
                            Latest Announcement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold mb-1">{announcements[0].title}</h3>
                        <p className="text-sm text-blue-800/80 dark:text-blue-300/80">{announcements[0].content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(announcements[0].createdAt), 'PPP')}</p>
                    </CardContent>
                </Card>
            )}
            
            <div className="grid gap-6 lg:grid-cols-3">
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Residence Details</CardTitle>
                            <CardDescription>Information about your currently assigned room.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {tenant.rentalName ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Home className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">{tenant.rentalName}</p>
                                            <p className="text-sm text-muted-foreground">Rental Property</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-4">
                                        <KeyRound className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Room {tenant.roomNumber}</p>
                                            <p className="text-sm text-muted-foreground">Your assigned room</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <BadgeDollarSign className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">KSh {tenant.rent?.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">You have not been assigned to a room yet.</p>
                           )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Overview</CardTitle>
                             <CardDescription>Your upcoming payment information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tenant.nextPaymentDue ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Payment Due:</p>
                                        <div className="text-2xl font-bold flex items-center gap-2">
                                            {format(new Date(tenant.nextPaymentDue), 'PPP')}
                                            {isPaymentDue && <Badge variant="destructive">Overdue</Badge>}
                                        </div>
                                    </div>
                                     <Button asChild size="lg">
                                        <Link href={`/payments/new?tenantId=${tenant.id}&tenantName=${tenant.firstName} ${tenant.secondName}&rentalId=${tenant.rentalId}&rentalName=${tenant.rentalName}&roomId=${tenant.roomId}&roomNumber=${tenant.roomNumber}&rent=${tenant.rent}&phone=${tenant.phone}`}>
                                            Pay KSh {tenant.rent?.toLocaleString()} Now
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                 <p className="text-center text-muted-foreground py-4">No payment information available. This will update once you are assigned a room.</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
                 
                 <div className="space-y-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>My Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-4">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{`${tenant.firstName} ${tenant.secondName}`}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{tenant.email}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{tenant.phone}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">ID: {tenant.idNumber}</span>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <Badge variant="outline">{tenant.gender}</Badge>
                                <Badge variant="outline">{tenant.maritalStatus}</Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Pencil className="mr-2" />
                                        Edit Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Edit Your Details</DialogTitle>
                                        <DialogDescription>
                                            Update your personal and emergency contact information.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <EditTenantForm tenant={tenant} onUpdate={handleUpdateTenant} />
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <CardTitle>Next of Kin</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4 text-sm">
                            {tenant.nextOfKinName ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{tenant.nextOfKinName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{tenant.nextOfKinPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{tenant.nextOfKinRelationship}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">Not provided. Please edit your details to add an emergency contact.</p>
                            )}
                         </CardContent>
                    </Card>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Submit a Complaint or Request</CardTitle>
                    <CardDescription>Having an issue? Let us know here.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-6">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">For any maintenance issues, repairs, or service requests, please use our dedicated maintenance page.</p>
                     <Button asChild>
                        <Link href="/clients/maintenance">Go to Maintenance Page</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
             <div className="grid gap-6 lg:grid-cols-3">
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                        <CardContent className="space-y-4">
                             <Skeleton className="h-12 w-full" />
                             <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                 </div>
                 <Card className="lg:col-span-1">
                     <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                 </Card>
             </div>
        </div>
    )
}

    