
'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Payment } from '@/lib/types';
import { getPayments } from '@/lib/api/payments';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const fetchedPayments = await getPayments();
                setPayments(fetchedPayments);
            } catch (error) {
                console.error("Failed to fetch payments", error);
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: "Failed to load payment history."
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Completed': return 'default';
            case 'Pending': return 'secondary';
            case 'Failed': return 'destructive';
            default: return 'outline';
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        // Firestore Timestamps have a toDate() method, but serialized ones might not.
        if (timestamp.toDate) {
            return format(timestamp.toDate(), 'PPpp');
        }
        // Handle serialized timestamps (which might be objects with seconds/nanoseconds)
        if (timestamp.seconds) {
            return format(new Date(timestamp.seconds * 1000), 'PPpp');
        }
        // Fallback for string or number timestamps
        return format(new Date(timestamp), 'PPpp');
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>View all payment transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Rental & Room</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Amount (KSh)</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Loading payments...</TableCell></TableRow>
                                ) : payments.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">No payment history found.</TableCell></TableRow>
                                ) : (
                                    payments.map(payment => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {formatDate(payment.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {payment.tenant ? `${payment.tenant.firstName} ${payment.tenant.secondName}` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {payment.rental?.name || 'N/A'} - {payment.room?.roomNumber || 'N/A'}
                                            </TableCell>
                                            <TableCell>{payment.type}</TableCell>
                                            <TableCell className="text-right">{payment.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
