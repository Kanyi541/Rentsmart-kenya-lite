
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Demo Data
const demoGlobalStats = { totalRentals: 3, totalTenants: 45, totalRooms: 60, occupiedRooms: 45 };
const demoRentals = [
    { id: 'demo1', name: 'Demo Heights', location: 'Demo City', ownerName: 'Demo Owner', ownerNumber: '0712345678', rooms: [] },
    { id: 'demo2', name: 'Sample Towers', location: 'Demo Suburb', ownerName: 'Demo Owner', ownerNumber: '0712345678', rooms: [] },
];
const demoRentalStats = {
    'demo1': { tenantCount: 20, occupiedRooms: 20, totalRooms: 25 },
    'demo2': { tenantCount: 25, occupiedRooms: 25, totalRooms: 35 },
};
const demoOccupancyDetails = {
    'demo1': [
        { id: 'r1', roomNumber: 'A101', roomType: '1 Bedroom', isOccupied: true, tenantName: 'John Doe', nextPaymentDue: '2024-08-01' },
        { id: 'r2', roomNumber: 'A102', roomType: '1 Bedroom', isOccupied: true, tenantName: 'Jane Smith', nextPaymentDue: '2024-08-01' },
        { id: 'r3', roomNumber: 'B201', roomType: 'Bedsitter', isOccupied: false, tenantName: null, nextPaymentDue: null },
    ],
    'demo2': [
        { id: 'r4', roomNumber: 'G01', roomType: '2 Bedroom', isOccupied: true, tenantName: 'Peter Jones', nextPaymentDue: '2024-08-05' },
    ]
};


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

const ROOMS_PER_PAGE = 5;

function Home() {
  const { isDemoUser } = useAuth();
  const [globalStats, setGlobalStats] = useState<DashboardStats>({ totalRentals: 0, totalTenants: 0, totalRooms: 0, occupiedRooms: 0 });
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [rentalStats, setRentalStats] = useState<RentalStats | null>(null);
  const [occupancyDetails, setOccupancyDetails] = useState<OccupancyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalDetailsLoading, setRentalDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();


  useEffect(() => {
    async function fetchInitialData() {
        setLoading(true);
        if (isDemoUser) {
            setGlobalStats(demoGlobalStats);
            setRentals(demoRentals as Rental[]);
            setLoading(false);
            return;
        }
        try {
            const [dashboardStats, fetchedRentals] = await Promise.all([
                getDashboardStats(),
                getRentals()
            ]);
            setGlobalStats(dashboardStats);
            setRentals(fetchedRentals);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setLoading(false);
        }
    }
    fetchInitialData();
  }, [isDemoUser]);

  useEffect(() => {
      async function fetchRentalDetails() {
          if (!selectedRentalId) {
            setRentalStats(null);
            setOccupancyDetails([]);
            return;
          };
          setRentalDetailsLoading(true);
          setCurrentPage(1); // Reset to first page on new selection
          if (isDemoUser) {
              setRentalStats(demoRentalStats[selectedRentalId as keyof typeof demoRentalStats]);
              setOccupancyDetails(demoOccupancyDetails[selectedRentalId as keyof typeof demoOccupancyDetails] as OccupancyDetails[]);
              setRentalDetailsLoading(false);
              return;
          }
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
  }, [selectedRentalId, isDemoUser]);

  const filteredOccupancyDetails = useMemo(() => {
    if (!searchQuery) {
        return occupancyDetails;
    }
    return occupancyDetails.filter(room => 
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [occupancyDetails, searchQuery]);

  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
    return filteredOccupancyDetails.slice(startIndex, startIndex + ROOMS_PER_PAGE);
  }, [filteredOccupancyDetails, currentPage]);

  const totalPages = Math.ceil(filteredOccupancyDetails.length / ROOMS_PER_PAGE);

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
            <Link href="/rentals">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalRentals}</div>}
                        <p className="text-xs text-muted-foreground">properties being managed</p>
                    </CardContent>
                </Card>
            </Link>
            <Link href="/tenants">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalTenants}</div>}
                        <p className="text-xs text-muted-foreground">tenants registered across all rentals</p>
                    </CardContent>
                </Card>
            </Link>
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
                    <div className="text-2xl font-bold">---</div>
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

            {selectedRentalId && (
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedRental?.name || "Occupancy Details"}</CardTitle>
                        <CardDescription>
                            {rentalDetailsLoading ? 'Loading details...' : `Showing ${paginatedRooms.length} of ${filteredOccupancyDetails.length} rooms. Tenants: ${rentalStats?.tenantCount ?? 0}, Occupied: ${rentalStats?.occupiedRooms ?? 0}/${rentalStats?.totalRooms ?? 0}`}
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
                                    <TableHead>Room No.</TableHead>
                                    <TableHead>Room Type</TableHead>
                                    <TableHead>Tenant Name</TableHead>
                                    <TableHead>Next Payment Due</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentalDetailsLoading ? (
                                    Array.from({ length: ROOMS_PER_PAGE }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paginatedRooms.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">{searchQuery ? 'No matching rooms found.' : 'No rooms found for this property.'}</TableCell></TableRow>
                                ) : (
                                    paginatedRooms.map(room => (
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
            )}
        </div>

      </div>
    </AppLayout>
  );
}

export default withAuth(Home);
