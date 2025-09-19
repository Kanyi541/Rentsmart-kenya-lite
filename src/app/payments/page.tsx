
'use client'

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GroupedPayment } from '@/lib/types';
import { getGroupedPayments } from '@/lib/api/payments';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PAYMENTS_PER_PAGE = 5;

export default function PaymentsPage() {
    const [payments, setPayments] = useState<GroupedPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const fetchedPayments = await getGroupedPayments();
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

    const filteredPayments = useMemo(() => {
        if (!searchQuery) {
            return payments;
        }
        return payments.filter(p =>
            p.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rentalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * PAYMENTS_PER_PAGE;
        return filteredPayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);
    }, [filteredPayments, currentPage]);

    const totalPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE);
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Completed': return 'default';
            case 'Failed': return 'destructive';
            default: return 'outline';
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        try {
            return format(new Date(timestamp), 'PPpp');
        } catch (error) {
            console.error("Failed to format date:", timestamp, error);
            return "Invalid Date";
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Initial Payment History</CardTitle>
                        <CardDescription>View all initial rent and deposit payments for new room assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by tenant, rental, or room..."
                                    className="w-full rounded-lg bg-background pl-8"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1); // Reset page on new search
                                    }}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Property & Room</TableHead>
                                    <TableHead className="text-right">Rent Paid (KSh)</TableHead>
                                    <TableHead className="text-right">Deposit Paid (KSh)</TableHead>
                                    <TableHead className="text-right">Total Paid (KSh)</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({length: PAYMENTS_PER_PAGE}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paginatedPayments.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center h-24">{searchQuery ? 'No matching payments found.' : 'No payment history found.'}</TableCell></TableRow>
                                ) : (
                                    paginatedPayments.map(payment => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {formatDate(payment.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {payment.tenantName}
                                            </TableCell>
                                            <TableCell>
                                                {payment.rentalName} - {payment.roomNumber}
                                            </TableCell>
                                            <TableCell className="text-right">{payment.rentPaid.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">{payment.depositPaid.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-semibold">{payment.totalPaid.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(payment.status)}>{payment.status === 'Completed' ? 'Cleared' : payment.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter>
                            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                                <div>
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}
