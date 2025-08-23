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

const initialRentals: Rental[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    location: 'Westlands, Nairobi',
    ownerName: 'Alice Mwangi',
    ownerNumber: '0711223344',
    rooms: [
      { id: '101', roomNumber: 'A101', roomType: '2 Bedroom', rent: 85000, isOccupied: false },
      { id: '102', roomNumber: 'A102', roomType: '3 Bedroom', rent: 120000, isOccupied: true },
      { id: '103', roomNumber: 'B201', roomType: '1 Bedroom', rent: 60000, isOccupied: false },
    ]
  },
  {
    id: '2',
    name: 'Karen Luxury Homes',
    location: 'Karen, Nairobi',
    ownerName: 'Bob Chege',
    ownerNumber: '0722334455',
    rooms: [
        { id: '201', roomNumber: 'H1', roomType: '4 Bedroom', rent: 250000, isOccupied: true },
        { id: '202', roomNumber: 'H2', roomType: '4 Bedroom', rent: 260000, isOccupied: true },
    ]
  },
  {
    id: '3',
    name: 'Kileleshwa Studios',
    location: 'Kileleshwa, Nairobi',
    ownerName: 'Charles Odira',
    ownerNumber: '0733445566',
    rooms: [
        { id: '301', roomNumber: 'S1', roomType: 'Bedsitter', rent: 45000, isOccupied: false },
        { id: '302', roomNumber: 'S2', roomType: 'Bedsitter', rent: 45000, isOccupied: false },
        { id: '303', roomNumber: 'S3', roomType: 'Single Room', rent: 25000, isOccupied: true },
    ]
  },
];


export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>(initialRentals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddRental = (data: Omit<Rental, 'id'>) => {
    const rental: Rental = {
      ...data,
      id: new Date().getTime().toString(),
    };
    setRentals(prev => [rental, ...prev]);
    toast({
      title: 'Rental Added!',
      description: `${data.name} in ${data.location} has been successfully added.`,
    });
    setIsDialogOpen(false);
  };

  const getUnoccupiedRooms = (rental: Rental) => {
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
                        {rentals.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No rentals added yet.</TableCell></TableRow>}
                        {rentals.map(rental => (
                            <TableRow key={rental.id}>
                                <TableCell className="font-medium">{rental.name}</TableCell>
                                <TableCell>{rental.ownerName}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{rental.rooms.length}</Badge>
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
