
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, BedDouble, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import withAuth from '@/components/auth/with-auth';
import { useEffect, useState } from 'react';
import { getDashboardStats, getStatsForRental } from '@/lib/api/dashboard';
import { getRentals } from '@/lib/api/rentals';
import type { Rental } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [loading, setLoading] = useState(true);
  const [rentalStatsLoading, setRentalStatsLoading] = useState(false);


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
      async function fetchRentalStats() {
          if (!selectedRentalId) return;
          setRentalStatsLoading(true);
          try {
              const stats = await getStatsForRental(selectedRentalId);
              setRentalStats(stats);
          } catch (error) {
              console.error(`Failed to fetch stats for rental ${selectedRentalId}`, error);
              setRentalStats(null);
          } finally {
              setRentalStatsLoading(false);
          }
      }
      fetchRentalStats();
  }, [selectedRentalId]);

  const selectedRental = rentals.find(r => r.id === selectedRentalId);


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
                    <Link href="/rentals/new">
                        <PlusCircle className="mr-2" />
                        Add Rental
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-initial">
                     <Link href="/tenants/new">
                        <PlusCircle className="mr-2" />
                        Add Tenant
                    </Link>
                </Button>
            </div>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <div className="border-t pt-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Property-Specific Stats</h2>
                    <p className="text-muted-foreground">Select a property to view its details.</p>
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

             <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tenants in Property</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {rentalStatsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{rentalStats?.tenantCount ?? 0}</div>}
                        <p className="text-xs text-muted-foreground">tenants in {selectedRental?.name || 'this property'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Property Occupancy</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {rentalStatsLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{rentalStats?.occupiedRooms ?? 0} / {rentalStats?.totalRooms ?? 0}</div>}
                        <p className="text-xs text-muted-foreground">rooms occupied in {selectedRental?.name || 'this property'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                         <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       {rentalStatsLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{rentalStats?.totalRooms ?? 0}</div>}
                        <p className="text-xs text-muted-foreground">total rooms in {selectedRental?.name || 'this property'}</p>
                    </CardContent>
                </Card>
             </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default withAuth(Home);
