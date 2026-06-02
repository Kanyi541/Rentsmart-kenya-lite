
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building, Users, BedDouble, PlusCircle, CalendarClock, Search, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
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
import { format, differenceInDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { renewSubscription } from '@/app/actions';

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
  const { orgId, organization, isDemoUser } = useAuth();
  const [globalStats, setGlobalStats] = useState<DashboardStats>({ totalRentals: 0, totalTenants: 0, totalRooms: 0, occupiedRooms: 0 });
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [rentalStats, setRentalStats] = useState<RentalStats | null>(null);
  const [occupancyDetails, setOccupancyDetails] = useState<OccupancyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalDetailsLoading, setRentalDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRenewing, setIsRenewing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInitialData() {
        if (!orgId) return;
        setLoading(true);
        try {
            const [dashboardStats, fetchedRentals] = await Promise.all([
                getDashboardStats(orgId),
                getRentals(orgId)
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
  }, [orgId]);

  useEffect(() => {
      async function fetchRentalDetails() {
          if (!selectedRentalId) {
            setRentalStats(null);
            setOccupancyDetails([]);
            return;
          };
          setRentalDetailsLoading(true);
          setCurrentPage(1);
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

  const handleRenew = async () => {
    if (!orgId) return;
    setIsRenewing(true);
    try {
        const res = await renewSubscription(orgId);
        if (res.error) throw new Error(res.error);
        toast({ title: "Subscription Renewed!", description: "Your organization's plan has been extended by 1 month." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Renewal Failed", description: "Could not process renewal payment simulation." });
    } finally {
        setIsRenewing(false);
    }
  };

  const filteredOccupancyDetails = useMemo(() => {
    if (!searchQuery) return occupancyDetails;
    return occupancyDetails.filter(room => 
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [occupancyDetails, searchQuery]);

  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
    return filteredOccupancyDetails.slice(startIndex, startIndex + ROOMS_PER_PAGE);
  }, [filteredOccupancyDetails, currentPage]);

  const daysToExpiry = organization?.subscriptionEndDate 
    ? differenceInDays(new Date(organization.subscriptionEndDate), new Date())
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SaaS Dashboard</h1>
                <p className="text-muted-foreground">Managing rentals for {organization?.name || 'your organization'}.</p>
            </div>
            {organization?.plan && (
                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground py-1 px-4 text-sm font-bold">
                    {organization.plan} Plan
                </Badge>
            )}
        </div>

        {daysToExpiry <= 7 && (
            <Alert variant={daysToExpiry <= 0 ? "destructive" : "default"} className={daysToExpiry > 0 ? "bg-yellow-50 border-yellow-200" : ""}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-bold">
                    {daysToExpiry <= 0 ? "Subscription Expired!" : "Subscription Renewal Required"}
                </AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <span>
                        {daysToExpiry <= 0 
                            ? "Your access to premium features has been restricted. Please renew your plan to continue." 
                            : `Your ${organization?.plan} plan expires in ${daysToExpiry} days. Renew now to avoid service interruption.`
                        }
                    </span>
                    <Button size="sm" variant={daysToExpiry <= 0 ? "default" : "outline"} className="w-fit" onClick={handleRenew} disabled={isRenewing}>
                        {isRenewing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Renew Plan Now"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalRentals}</div>}
                    <p className="text-xs text-muted-foreground">Plan limit: {organization?.plan === 'Starter' ? '1' : organization?.plan === 'Growth' ? '5' : 'Unlimited'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalStats.totalTenants}</div>}
                    <p className="text-xs text-muted-foreground">registered in your org</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{globalStats.occupiedRooms} / {globalStats.totalRooms}</div>}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {organization?.subscriptionEndDate ? format(new Date(organization.subscriptionEndDate), 'MMM d, yyyy') : '---'}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="border-t pt-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Org Properties</h2>
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
                        <CardTitle>{rentals.find(r => r.id === selectedRentalId)?.name || "Occupancy Details"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search rooms..."
                                    className="w-full rounded-lg bg-background pl-8"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room No.</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Next Payment</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentalDetailsLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paginatedRooms.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No rooms found.</TableCell></TableRow>
                                ) : (
                                    paginatedRooms.map(room => (
                                        <TableRow key={room.id}>
                                            <TableCell className="font-medium">{room.roomNumber}</TableCell>
                                            <TableCell>{room.tenantName || '---'}</TableCell>
                                            <TableCell>
                                                {room.nextPaymentDue ? format(new Date(room.nextPaymentDue), 'PPP') : '---'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={room.isOccupied ? 'default' : 'secondary'}>
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
            )}
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(Home);
