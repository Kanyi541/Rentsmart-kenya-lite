
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, BedDouble, PlusCircle } from 'lucide-react';
import { getDashboardStats } from '@/lib/api/dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your RentSmart dashboard.</p>
            </div>
            <div className="flex gap-2">
                <Button asChild>
                    <Link href="/rentals">
                        <PlusCircle className="mr-2" />
                        Add New Rental
                    </Link>
                </Button>
                <Button asChild variant="outline">
                     <Link href="/tenants">
                        <PlusCircle className="mr-2" />
                        Add New Tenant
                    </Link>
                </Button>
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Rentals
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRentals}</div>
                    <p className="text-xs text-muted-foreground">
                        properties being managed
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Tenants
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTenants}</div>
                     <p className="text-xs text-muted-foreground">
                        tenants registered
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Occupied Rooms
                    </CardTitle>
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.occupiedRooms} / {stats.totalRooms}</div>
                     <p className="text-xs text-muted-foreground">
                        rooms currently occupied
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
