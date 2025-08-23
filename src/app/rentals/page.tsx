
'use client'

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { RentalForm } from '@/components/rental-form';
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
import { PlusCircle } from 'lucide-react';
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
import { addRental } from '@/app/actions';
import { getRentals } from '@/lib/api/rentals';

export default function RentalsPage({ rentals: initialRentals }: { rentals: Rental[] }) {
  const [rentals, setRentals] = useState<Rental[]>(initialRentals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


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
        setIsDialogOpen(false);
        router.refresh();
        const updatedRentals = await getRentals();
        setRentals(updatedRentals);
    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to add rental.'
        })
    }
  };

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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            <TableHead>Owner's Name</TableHead>
                            <TableHead className="text-center">Total Rooms</TableHead>
                            <TableHead className="text-center">Unoccupied Rooms</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals && rentals.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No rentals added yet.</TableCell></TableRow> :
                        rentals && rentals.map(rental => (
                            <TableRow key={rental.id}>
                                <TableCell className="font-medium">{rental.name}</TableCell>
                                <TableCell>{rental.ownerName}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{rental.rooms?.length ?? 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                     <Badge variant={getUnoccupiedRooms(rental) > 0 ? 'default' : 'destructive'} className="text-white">
                                        {getUnoccupiedRooms(rental)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
               </Table>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
