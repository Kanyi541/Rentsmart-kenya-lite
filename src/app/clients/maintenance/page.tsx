
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { maintenanceRequestSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getTenantById } from '@/lib/api/tenants';
import type { Tenant, MaintenanceRequest } from '@/lib/types';
import { createMaintenanceRequest } from '@/app/actions';
import { Loader2, Image, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getMaintenanceRequestsForTenant } from '@/lib/api/maintenance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type MaintenanceRequestFormValues = z.infer<typeof maintenanceRequestSchema>;

const demoRequests: MaintenanceRequest[] = [
    { id: 'mr1', description: 'The kitchen sink is clogged.', status: 'Pending', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), tenantId: 'demotenant', rentalId: 'demo1', roomId: 'r2', rentalName: 'Demo Heights', roomNumber: 'A102' }
];

export default function MaintenancePage() {
    const { user, isDemoUser } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<MaintenanceRequestFormValues>({
        resolver: zodResolver(maintenanceRequestSchema),
        defaultValues: {
            description: '',
            photo: undefined,
        }
    });
    
    async function fetchInitialData() {
        if (!user) return;
        setLoading(true);

        if (isDemoUser) {
            const storedTenant = localStorage.getItem('demoTenant');
            setTenant(storedTenant ? JSON.parse(storedTenant) : null);
            const storedRequests = localStorage.getItem('demoMaintenanceRequests');
            setRequests(storedRequests ? JSON.parse(storedRequests) : demoRequests);
            setLoading(false);
            return;
        }

        try {
            const [tenantData, requestData] = await Promise.all([
                getTenantById(user.uid),
                getMaintenanceRequestsForTenant(user.uid)
            ]);
            setTenant(tenantData);
            setRequests(requestData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load your details or requests." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialData();
    }, [user, isDemoUser]);

    const onSubmit = async (data: MaintenanceRequestFormValues) => {
        if (!user || !tenant?.rentalId || !tenant?.roomId) {
            toast({ variant: 'destructive', title: "Error", description: "Your tenant information is incomplete. Cannot submit request." });
            return;
        }

        setIsSubmitting(true);

        if (isDemoUser && tenant) {
            const newRequest: MaintenanceRequest = {
                id: `demo_mr_${new Date().getTime()}`,
                description: data.description,
                tenantId: user.uid,
                rentalId: tenant.rentalId,
                roomId: tenant.roomId,
                rentalName: tenant.rentalName,
                roomNumber: tenant.roomNumber,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            const updatedRequests = [newRequest, ...requests];
            setRequests(updatedRequests);
            localStorage.setItem('demoMaintenanceRequests', JSON.stringify(updatedRequests));
            toast({ title: "Request Submitted!", description: "This is a demo. Your request is saved in local storage." });
            form.reset();
            setIsSubmitting(false);
            return;
        }
        
        try {
            // NOTE: Photo upload is simulated.
            const result = await createMaintenanceRequest({
                description: data.description,
                tenantId: user.uid,
                rentalId: tenant.rentalId,
                roomId: tenant.roomId,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            toast({ title: "Request Submitted!", description: "Your maintenance request has been sent to the landlord." });
            form.reset();
            await fetchInitialData(); // Refresh the list
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Submission Failed", description: error.message || "An unknown error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Pending': return 'secondary';
            case 'In Progress': return 'default';
            case 'Completed': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Maintenance Request</CardTitle>
                            <CardDescription>Describe the issue you're experiencing. Attach a photo if it helps.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!tenant?.rentalId ? (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Not Assigned to a Room</AlertTitle>
                                    <AlertDescription>
                                        You must be assigned to a room before you can submit maintenance requests.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description of Issue</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="e.g., The kitchen sink is leaking under the cabinet." {...field} rows={5} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="photo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Upload Photo (Optional)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                             <Image className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input type="file" className="pl-8" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                                        </div>
                                                    </FormControl>
                                                     <p className="text-xs text-muted-foreground">Note: Photo upload is for demonstration and is not functional yet.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit Request
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Request History</CardTitle>
                             <CardDescription>Track the status of your submitted requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Issue</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">Loading requests...</TableCell></TableRow>
                                    ) : requests.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">You have not submitted any requests yet.</TableCell></TableRow>
                                    ) : (
                                        requests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{format(new Date(req.createdAt), 'PP')}</TableCell>
                                                <TableCell className="max-w-[300px] truncate">{req.description}</TableCell>
                                                <TableCell>{req.rentalName} - {req.roomNumber}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>
             </div>
        </AppLayout>
    )
}
