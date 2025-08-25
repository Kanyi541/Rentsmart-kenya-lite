
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, BedDouble, PlusCircle, CalendarClock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import withAuth from '@/components/auth/with-auth';
import { useEffect, useState, useMemo } from 'react';
import { getDashboardStats, getStatsForRental } from '@/lib/api/dashboard';
import { getRentals } from '@/lib/api/rentals';
import type { Rental } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getOccupancyDetailsForRental, type OccupancyDetails } from '@/lib/api/occupancy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface DashboardStats {
    totalRentals: number;
    totalTenants: number;
    totalRooms: number;
    occupiedRooms: number;
}

interface RentalStats {
    tenantCount: number;
    occupiedRooms: number;
    totalRooms: number;
}

function Home() {
  const [globalStats, setGlobalStats] = useState<DashboardStats>({ totalRentals: 0, totalTenants: 0, totalRooms: 0, occupiedRooms: 0 });
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [rentalStats, setRentalStats] = useState<RentalStats | null>(null);
  const [occupancyDetails, setOccupancyDetails] = useState<OccupancyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalDetailsLoading, setRentalDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    async function fetchInitialData() {
        setLoading(true);
        try {
            const [dashboardStats, fetchedRentals] = await Promise.all([
                getDashboardStats(),
                getRentals()
            ]);
            setGlobalStats(dashboardStats);
            setRentals(fetchedRentals);
            if (fetchedRentals.length > 0) {
                const firstRentalId = fetchedRentals[0].id;
                setSelectedRentalId(firstRentalId);
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            // Handle error with a toast or message
        } finally {
            setLoading(false);
        }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
      async function fetchRentalDetails() {
          if (!selectedRentalId) return;
          setRentalDetailsLoading(true);
          try {
              const [stats, details] = await Promise.all([
                getStatsForRental(selectedRentalId),
                getOccupancyDetailsForRental(selectedRentalId)
              ]);
              setRentalStats(stats);
              setOccupancyDetails(details);
          } catch (error) {
              console.error(`Failed to fetch details for rental ${selectedRentalId}`, error);
              setRentalStats(null);
              setOccupancyDetails([]);
          } finally {
              setRentalDetailsLoading(false);
          }
      }
      fetchRentalDetails();
  }, [selectedRentalId]);

  const filteredOccupancyDetails = useMemo(() => {
    if (!searchQuery) {
        return occupancyDetails;
    }
    return occupancyDetails.filter(room => 
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [occupancyDetails, searchQuery]);

  const selectedRental = rentals.find(r => r.id === selectedRentalId);

  const getStatusVariant = (isOccupied: boolean) => {
    return isOccupied ? 'default' : 'secondary';
  }


  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your RentSmart dashboard.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button asChild className="flex-1 sm:flex-initial">
                    <Link href="/rentals">
                        <PlusCircle className="mr-2" />
                        Add Rental
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-initial">
                     <Link href="/tenants">
                        <PlusCircle className="mr-2" />
                        Add Tenant
                    </Link>
                </Button>
            </div>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalRentals}</div>}
                    <p className="text-xs text-muted-foreground">properties being managed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalTenants}</div>}
                     <p className="text-xs text-muted-foreground">tenants registered across all rentals</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Occupancy</CardTitle>
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{globalStats.occupiedRooms} / {globalStats.totalRooms}</div>}
                     <p className="text-xs text-muted-foreground">rooms currently occupied</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Payment Due</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {rentalDetailsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">-</div>}
                    <p className="text-xs text-muted-foreground">coming soon</p>
                </CardContent>
            </Card>
        </div>

        <div className="border-t pt-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Property-Specific Details</h2>
                    <p className="text-muted-foreground">Select a property to view its occupancy and payment details.</p>
                </div>
                 <div className="w-full sm:w-64">
                    {loading ? <Skeleton className="h-10 w-full" /> : (
                        <Select onValueChange={setSelectedRentalId} value={selectedRentalId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Rental" />
                            </SelectTrigger>
                            <SelectContent>
                                {rentals.map(rental => (
                                    <SelectItem key={rental.id} value={rental.id}>{rental.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{selectedRental?.name || "Occupancy Details"}</CardTitle>
                    <CardDescription>
                        {rentalDetailsLoading ? 'Loading details...' : `Showing ${filteredOccupancyDetails.length} of ${occupancyDetails.length} rooms. Tenants: ${rentalStats?.tenantCount ?? 0}, Occupied: ${rentalStats?.occupiedRooms ?? 0}/${rentalStats?.totalRooms ?? 0}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by room number or tenant name..."
                                className="w-full rounded-lg bg-background pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room No.</TableHead>
                                <TableHead>Room Type</TableHead>
                                <TableHead>Tenant Name</TableHead>
                                <TableHead>Next Payment Due</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rentalDetailsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOccupancyDetails.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">{searchQuery ? 'No matching rooms found.' : 'No rooms found for this property.'}</TableCell></TableRow>
                            ) : (
                                filteredOccupancyDetails.map(room => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.roomNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{room.roomType}</Badge>
                                        </TableCell>
                                        <TableCell>{room.tenantName || '---'}</TableCell>
                                        <TableCell>
                                            {room.nextPaymentDue ? format(new Date(room.nextPaymentDue), 'PPP') : '---'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusVariant(room.isOccupied)}>
                                                {room.isOccupied ? 'Occupied' : 'Vacant'}
                                            </Badge>
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
  );
}

export default withAuth(Home);
