
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
import { PlusCircle, Pencil } from 'lucide-react';
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
import { addRental, getRentals, updateRental } from '@/lib/api/rentals';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  async function fetchRentals() {
    const fetchedRentals = await getRentals();
    setRentals(fetchedRentals);
  }

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleAddRental = async (data: Omit<Rental, 'id' | 'rooms'> & { rooms: Omit<Rental['rooms'][0], 'id'>[]}) => {
    try {
        const result = await addRental(data);
        if (result.error) {
            throw new Error(result.error);
        }
        
        toast({
          title: 'Rental Added!',
          description: `${data.name} in ${data.location} has been successfully added.`,
        });
        setIsAddDialogOpen(false);
        await fetchRentals();
        router.refresh();
    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to add rental.'
        })
    }
  };

  const handleUpdateRental = async (rentalId: string, data: Omit<Rental, 'id' | 'rooms'> & { rooms: Omit<Rental['rooms'][0], 'id'>[]}) => {
    try {
      const result = await updateRental(rentalId, data);
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Rental Updated!',
        description: `${data.name} has been successfully updated.`
      });
      setIsEditDialogOpen(false);
      setSelectedRental(null);
      await fetchRentals();
      router.refresh();

    } catch (error: any) {
       console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to update rental.'
        })
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
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Rental Properties</CardTitle>
                    <CardDescription>View and manage all rental properties in your system.</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2" />
                                Add New Rental
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                             <DialogHeader>
                                <DialogTitle>Add a New Rental</DialogTitle>
                                <DialogDescription>
                                    Fill in the details of the rental property and its rooms. Click save when you're done.
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
                        {rentals && rentals.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No rentals added yet.</TableCell></TableRow> :
                        rentals && rentals.map(rental => (
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
                        Update the details of the rental property and its rooms. Click save when you're done.
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
