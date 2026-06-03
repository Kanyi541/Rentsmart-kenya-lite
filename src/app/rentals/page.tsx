'use client'

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { RentalForm } from '@/components/rental-form';
import { EditRentalForm } from '@/components/edit-rental-form';
import type { Rental } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addRental, getRentals, updateRental } from '@/lib/api/rentals';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RentalsPage() {
  const { orgId, organization, isDemoUser } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const planLimit = organization?.plan === 'Starter' ? 1 : organization?.plan === 'Growth' ? 5 : Infinity;
  const isLimitReached = rentals.length >= planLimit;

  async function fetchRentals() {
    if (!orgId) return;
    if (isDemoUser) {
        setRentals([
            { id: 'demo1', orgId: 'demo_org', name: 'Demo Heights', location: 'Demo City', ownerName: 'Demo Owner', ownerNumber: '0712345678', rooms: [{id: 'r1', roomNumber: 'A1', roomType: '1 Bedroom', rent: 10000, isOccupied: true}] },
            { id: 'demo2', orgId: 'demo_org', name: 'Sample Towers', location: 'Demo Suburb', ownerName: 'Demo Owner', ownerNumber: '0712345678', rooms: [{id: 'r2', roomNumber: 'B2', roomType: 'Bedsitter', rent: 5000, isOccupied: false}] },
        ]);
        return;
    }
    const fetchedRentals = await getRentals(orgId);
    setRentals(fetchedRentals);
  }

  useEffect(() => {
    fetchRentals();
  }, [orgId, isDemoUser]);

  const handleAddRental = async (data: Omit<Rental, 'id' | 'rooms'> & { rooms: Omit<Rental['rooms'][0], 'id'>[]}) => {
    if (isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Adding new rentals is disabled in demo mode.' });
        setIsAddDialogOpen(false);
        return;
    }
    if (isLimitReached) {
        toast({ variant: 'destructive', title: 'Limit Reached', description: `Your ${organization?.plan} plan allows only ${planLimit} rental(s). Please upgrade to add more.` });
        return;
    }
    try {
        const result = await addRental({ ...data, orgId: orgId! });
        if (result.error) throw new Error(result.error);
        
        toast({ title: 'Rental Added!', description: `${data.name} has been successfully added.` });
        setIsAddDialogOpen(false);
        await fetchRentals();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to add rental.' })
    }
  };

  const handleUpdateRental = async (rentalId: string, data: Omit<Rental, 'id' | 'rooms'> & { rooms: Omit<Rental['rooms'][0], 'id'>[]}) => {
    if (isDemoUser) {
        toast({ title: 'Demo Mode', description: 'Updating is disabled in demo mode.' });
        setIsEditDialogOpen(false);
        return;
    }
    try {
      const result = await updateRental(rentalId, data);
      if (result.error) throw new Error(result.error);
      toast({ title: 'Rental Updated!', description: `${data.name} has been successfully updated.` });
      setIsEditDialogOpen(false);
      await fetchRentals();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update rental.' })
    }
  };

  const openEditDialog = (rental: Rental) => {
    setSelectedRental(rental);
    setIsEditDialogOpen(true);
  }

  const getUnoccupiedRooms = (rental: Rental) => {
    if (!rental.rooms) return 0;
    return rental.rooms.filter(room => !room.isOccupied).length;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {isLimitReached && (
            <Alert className="bg-blue-50 border-blue-200">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold">Rental Limit Reached</AlertTitle>
                <AlertDescription className="flex items-center justify-between mt-1">
                    <span>You've reached the {planLimit} property limit for the {organization?.plan} plan.</span>
                    <Button variant="link" className="font-bold h-fit p-0" asChild>
                        <Link href="/admin/subscription/plans">
                            Upgrade your plan to add more properties
                        </Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Rental Properties</CardTitle>
                    <CardDescription>View and manage all rental properties. Total: {rentals.length} / {organization?.plan === 'Scale' ? 'Unlimited' : planLimit}</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={isLimitReached}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Rental
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                             <DialogHeader>
                                <DialogTitle>Add a New Rental</DialogTitle>
                                <DialogDescription>
                                    You are on the {organization?.plan} plan ({rentals.length}/{planLimit} used).
                                </DialogDescription>
                            </DialogHeader>
                            <RentalForm onAddRental={handleAddRental} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
               <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rental Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-center">Total Rooms</TableHead>
                            <TableHead className="text-center">Unoccupied Rooms</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No rentals added yet.</TableCell></TableRow> :
                        rentals.map(rental => (
                            <TableRow key={rental.id}>
                                <TableCell className="font-medium">{rental.name}</TableCell>
                                <TableCell>{rental.location}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{rental.rooms?.length ?? 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                     <Badge variant={getUnoccupiedRooms(rental) > 0 ? 'default' : 'destructive'} className="text-white">
                                        {getUnoccupiedRooms(rental)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(rental)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
               </Table>
            </CardContent>
        </Card>
      </div>

       <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
            setIsEditDialogOpen(isOpen);
            if (!isOpen) setSelectedRental(null);
       }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                    <DialogTitle>Edit Rental Property</DialogTitle>
                    <DialogDescription>
                        Update details and manage room inventory.
                    </DialogDescription>
                </DialogHeader>
                {selectedRental && (
                    <EditRentalForm 
                        rental={selectedRental} 
                        onUpdateRental={handleUpdateRental}
                    />
                )}
            </DialogContent>
        </Dialog>
    </AppLayout>
  )
}
