import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, BedDouble } from 'lucide-react';
import type { Rental, Tenant } from '@/lib/types';

export default function Home({ rentals, tenants }: { rentals: Rental[], tenants: Tenant[] }) {
    const totalRentals = rentals?.length || 0;
    const totalTenants = tenants?.length || 0;

    const totalRooms = rentals?.reduce((acc, rental) => acc + (rental.rooms?.length || 0), 0) || 0;
    const occupiedRooms = rentals?.reduce((acc, rental) => acc + (rental.rooms?.filter(room => room.isOccupied).length || 0), 0) || 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your RentSmart dashboard.</p>
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
                    <div className="text-2xl font-bold">{totalRentals}</div>
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
                    <div className="text-2xl font-bold">{totalTenants}</div>
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
                    <div className="text-2xl font-bold">{occupiedRooms} / {totalRooms}</div>
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
