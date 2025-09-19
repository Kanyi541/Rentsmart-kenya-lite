
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { complaintSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getTenantById } from '@/lib/api/tenants';
import type { Tenant, Complaint } from '@/lib/types';
import { createComplaint } from '@/app/actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getComplaintsForTenant } from '@/lib/api/complaints';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function ComplaintsPage() {
    const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            subject: '',
            description: '',
        }
    });
    
    async function fetchInitialData() {
        if (!user) return;
        try {
            setLoading(true);
            const [tenantData, complaintsData] = await Promise.all([
                getTenantById(user.uid),
                getComplaintsForTenant(user.uid)
            ]);
            setTenant(tenantData);
            setComplaints(complaintsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load your details or complaints." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialData();
    }, [user]);

    const onSubmit = async (data: ComplaintFormValues) => {
        if (!user || !tenant?.rentalId || !tenant?.roomId) {
            toast({ variant: 'destructive', title: "Error", description: "Your tenant information is incomplete. Cannot submit complaint." });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createComplaint({
                subject: data.subject,
                description: data.description,
                tenantId: user.uid,
                rentalId: tenant.rentalId,
                roomId: tenant.roomId,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            toast({ title: "Complaint Submitted!", description: "Your complaint has been sent to the landlord." });
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
            case 'New': return 'secondary';
            case 'Investigating': return 'default';
            case 'Resolved': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Complaint</CardTitle>
                            <CardDescription>Submit a formal complaint regarding tenancy, neighbors, or other issues.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!tenant?.rentalId ? (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Not Assigned to a Room</AlertTitle>
                                    <AlertDescription>
                                        You must be assigned to a room before you can submit complaints.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Noise Complaint, Lease Question" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description of Complaint</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Please provide as much detail as possible..." {...field} rows={5} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit Complaint
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
                            <CardTitle>My Complaint History</CardTitle>
                             <CardDescription>Track the status of your submitted complaints.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">Loading complaints...</TableCell></TableRow>
                                    ) : complaints.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">You have not submitted any complaints yet.</TableCell></TableRow>
                                    ) : (
                                        complaints.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{format(new Date(req.createdAt), 'PP')}</TableCell>
                                                <TableCell className="max-w-[300px] truncate">{req.subject}</TableCell>
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
