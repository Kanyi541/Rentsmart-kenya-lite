
'use client'

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Complaint } from '@/lib/types';
import { getAllComplaints } from '@/lib/api/complaints';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const fetchedData = await getAllComplaints();
                setComplaints(fetchedData);
            } catch (error) {
                console.error("Failed to fetch complaints", error);
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: "Failed to load complaint history."
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const filteredComplaints = useMemo(() => {
        if (!searchQuery) {
            return complaints;
        }
        return complaints.filter(p =>
            p.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rentalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [complaints, searchQuery]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'Investigating': return 'default';
            case 'Resolved': return 'outline';
            default: return 'secondary';
        }
    }

    const handleStatusChange = (complaintId: string, newStatus: string) => {
        // In a real app, you would call a server action here to update the status in Firestore.
        // For now, we'll just update the local state to simulate the change.
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus as Complaint['status'] } : c));
        toast({ title: "Status Updated", description: `Complaint status set to ${newStatus}.` });
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Complaints</CardTitle>
                        <CardDescription>View and manage all tenant complaints and disputes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by tenant, property, subject..."
                                    className="w-full rounded-lg bg-background pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredComplaints.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">{searchQuery ? 'No matching complaints found.' : 'No complaints have been submitted yet.'}</TableCell></TableRow>
                                ) : (
                                    filteredComplaints.map(complaint => (
                                        <TableRow key={complaint.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(complaint.createdAt), 'PP')}
                                            </TableCell>
                                            <TableCell>
                                                {complaint.tenantName}
                                            </TableCell>
                                            <TableCell>
                                                {complaint.rentalName} - {complaint.roomNumber}
                                            </TableCell>
                                            <TableCell className="max-w-[250px] truncate" title={complaint.subject}>
                                                {complaint.subject}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Select onValueChange={(value) => handleStatusChange(complaint.id, value)} defaultValue={complaint.status}>
                                                    <SelectTrigger className="w-32 mx-auto">
                                                        <SelectValue>
                                                            <Badge variant={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="New">New</SelectItem>
                                                        <SelectItem value="Investigating">Investigating</SelectItem>
                                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
