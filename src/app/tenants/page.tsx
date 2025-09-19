
'use client'

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BedDouble, Search, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTenants } from '@/lib/api/tenants';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

// Demo Data
const demoTenants: Tenant[] = [
    { id: 'demotenant', firstName: 'Demo', secondName: 'Tenant', email: 'tenant@demo.com', phone: '0700123123', rentalName: 'Demo Heights', roomNumber: 'A102', idNumber: '12345678', gender: 'Female', maritalStatus: 'Single', createdAt: new Date().toISOString() },
    { id: '2', firstName: 'John', secondName: 'Doe', email: 'john.d@example.com', phone: '0712345678', rentalName: 'Demo Heights', roomNumber: 'A101', idNumber: '23456789', gender: 'Male', maritalStatus: 'Married', createdAt: new Date().toISOString() },
    { id: '3', firstName: 'Jane', secondName: 'Smith', email: 'jane.s@example.com', phone: '0723456789', rentalName: 'Sample Towers', roomNumber: 'G01', idNumber: '34567890', gender: 'Female', maritalStatus: 'Single', createdAt: new Date().toISOString() },
    { id: '4', firstName: 'Unassigned', secondName: 'User', email: 'unassigned@example.com', phone: '0734567890', idNumber: '45678901', gender: 'Male', maritalStatus: 'Single', createdAt: new Date().toISOString() },
];


export default function TenantsPage() {
    const { isDemoUser } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { toast } = useToast();

    async function fetchTenants() {
        setLoading(true);
        if (isDemoUser) {
            // NOTE: In a real demo, you might want to merge newly registered demo users from local storage
            // with a base list. For simplicity, we'll just use a static list.
            const storedTenants = localStorage.getItem('demoTenants');
            const storedTenant = localStorage.getItem('demoTenant');
            // A simple logic to combine initial demo data with a potentially updated demo tenant
            let finalTenants = storedTenants ? JSON.parse(storedTenants) : demoTenants;
            if (storedTenant) {
                 const parsedTenant = JSON.parse(storedTenant);
                 const index = finalTenants.findIndex((t: Tenant) => t.id === parsedTenant.id);
                 if (index !== -1) {
                     finalTenants[index] = parsedTenant;
                 } else {
                     finalTenants.push(parsedTenant);
                 }
            }
            setTenants(finalTenants);
            setLoading(false);
            return;
        }
        try {
            const fetchedTenants = await getTenants();
            setTenants(fetchedTenants);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to load tenant data."
            })
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTenants();
    }, [isDemoUser, toast]);

    const filteredTenants = useMemo(() => {
        let filtered = tenants;

        // Filter by status
        if (filterStatus === 'assigned') {
            filtered = filtered.filter(t => t.rentalName);
        } else if (filterStatus === 'unassigned') {
            filtered = filtered.filter(t => !t.rentalName);
        }

        // Filter by search query
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                `${t.firstName} ${t.secondName}`.toLowerCase().includes(lowercasedQuery) ||
                t.phone.toLowerCase().includes(lowercasedQuery) ||
                t.email.toLowerCase().includes(lowercasedQuery)
            );
        }

        return filtered;
    }, [tenants, searchQuery, filterStatus]);

    return (
        <AppLayout>
             <div className="space-y-4 md:space-y-8">
                <div className="flex items-start flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="grid gap-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">Tenants</CardTitle>
                        <CardDescription>View, manage, search, and filter all registered tenants. Tenants must register themselves via the client portal.</CardDescription>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name, phone, or email..."
                                    className="w-full rounded-lg bg-background pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <ListFilter className="h-4 w-4" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
                                        <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="assigned">Assigned</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="unassigned">Unassigned</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions / Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredTenants.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No tenants found.</TableCell></TableRow>
                                ) : (
                                    filteredTenants.map(tenant => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">
                                                {`${tenant.firstName} ${tenant.secondName} ${tenant.thirdName || ''}`.trim()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{tenant.phone}</span>
                                                    <span className="text-xs text-muted-foreground">{tenant.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tenant.rentalName ? (
                                                    <Badge variant="default">Assigned</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Unassigned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {tenant.rentalName ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-semibold">{tenant.rentalName}</span>
                                                        <span className="text-sm text-muted-foreground">Room: {tenant.roomNumber}</span>
                                                    </div>
                                                ) : (
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href="/assignments">
                                                            <BedDouble className="mr-2 h-4 w-4" />
                                                            Assign a Room
                                                        </Link>
                                                    </Button>
                                                )}
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
    );
}

    