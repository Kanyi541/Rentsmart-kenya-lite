
'use client'

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MoveOutNotice } from '@/lib/types';
import { getAllNotices, updateNoticeStatus } from '@/lib/api/move-out';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

// Demo Data
const demoNotices: MoveOutNotice[] = [
    { id: '1', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), tenantName: 'Alice Johnson', rentalName: 'Demo Heights', roomNumber: 'C301', moveOutDate: new Date(Date.now() + 86400000 * 25), noticeType: 'Standard', status: 'Pending', tenantId: '', rentalId: '', roomId: '' },
    { id: '2', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), tenantName: 'Bob Williams', rentalName: 'Sample Towers', roomNumber: 'B105', moveOutDate: new Date(Date.now() + 86400000 * 5), noticeType: 'Immediate', status: 'Pending', tenantId: '', rentalId: '', roomId: '' },
    { id: '3', createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), tenantName: 'Charlie Brown', rentalName: 'Demo Heights', roomNumber: 'D402', moveOutDate: new Date(Date.now() - 86400000 * 2), noticeType: 'Standard', status: 'Processed', tenantId: '', rentalId: '', roomId: '' },
];


export default function AdminMoveOutPage() {
    const { isDemoUser } = useAuth();
    const [notices, setNotices] = useState<MoveOutNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    async function fetchData() {
        setLoading(true);
        if (isDemoUser) {
            setNotices(demoNotices);
            setLoading(false);
            return;
        }
        try {
            const fetchedData = await getAllNotices();
            setNotices(fetchedData);
        } catch (error) {
            console.error("Failed to fetch notices", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to load move-out notices."
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [isDemoUser, toast]);

    const filteredNotices = useMemo(() => {
        if (!searchQuery) {
            return notices;
        }
        return notices.filter(p =>
            p.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rentalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notices, searchQuery]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Pending': return 'destructive';
            case 'Processed': return 'default';
            default: return 'secondary';
        }
    }

    const getTypeVariant = (type: string) => {
        return type === 'Immediate' ? 'destructive' : 'secondary';
    }

    const handleStatusChange = async (noticeId: string, newStatus: MoveOutNotice['status']) => {
        if (isDemoUser) {
            setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, status: newStatus } : n));
            toast({ title: 'Demo Mode', description: `Status changed to ${newStatus}. This is not saved.` });
            return;
        }
        try {
            await updateNoticeStatus(noticeId, newStatus);
            setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, status: newStatus } : n));
            toast({ title: "Status Updated", description: `Notice status set to ${newStatus}.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update notice status.' });
        }
    }

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Move-Out Notices</CardTitle>
                        <CardDescription>Review and manage all tenant notices to vacate.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by tenant, property, or room..."
                                    className="w-full rounded-lg bg-background pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Notice Date</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Move-Out Date</TableHead>
                                    <TableHead>Notice Type</TableHead>
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
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredNotices.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">{searchQuery ? 'No matching notices found.' : 'No move-out notices have been submitted yet.'}</TableCell></TableRow>
                                ) : (
                                    filteredNotices.map(notice => (
                                        <TableRow key={notice.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(notice.createdAt), 'PP')}
                                            </TableCell>
                                            <TableCell>
                                                {notice.tenantName}
                                            </TableCell>
                                            <TableCell>
                                                {notice.rentalName} - {notice.roomNumber}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(notice.moveOutDate), 'PP')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getTypeVariant(notice.noticeType)}>{notice.noticeType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Select onValueChange={(value: MoveOutNotice['status']) => handleStatusChange(notice.id, value)} defaultValue={notice.status}>
                                                    <SelectTrigger className="w-32 mx-auto">
                                                        <SelectValue>
                                                            <Badge variant={getStatusVariant(notice.status)}>{notice.status}</Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="Processed">Processed</SelectItem>
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
