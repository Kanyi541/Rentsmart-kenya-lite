'use client'

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client, Rental, Room, Assignment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assignmentSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - in a real app, this would come from a database
const mockClients: Client[] = [
    { id: 'c1', name: 'John Doe', phone: '0712345678', email: 'john@test.com'},
    { id: 'c2', name: 'Jane Smith', phone: '0787654321', email: 'jane@test.com'}
];
const mockRentals: Rental[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    location: 'Westlands, Nairobi',
    ownerName: 'Alice Mwangi',
    ownerNumber: '0711223344',
    rooms: [
      { id: '101', roomNumber: 'A101', roomType: '2 Bedroom', rent: 85000, isOccupied: false },
      { id: '102', roomNumber: 'A102', roomType: '3 Bedroom', rent: 120000, isOccupied: true },
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
    ]
  },
];


type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [rentals, setRentals] = useState<Rental[]>(mockRentals);
    const { toast } = useToast();

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            clientId: '',
            rentalId: '',
            roomId: ''
        }
    })

    const selectedRentalId = form.watch('rentalId');

    const availableRooms = useMemo(() => {
        if (!selectedRentalId) return [];
        const rental = rentals.find(r => r.id === selectedRentalId);
        return rental ? rental.rooms.filter(room => !room.isOccupied) : [];
    }, [selectedRentalId, rentals]);

    const handleAssignRoom = (data: AssignmentFormValues) => {
        // Create new assignment
        const newAssignment: Assignment = {
            ...data,
            id: new Date().getTime().toString()
        }
        setAssignments(prev => [...prev, newAssignment]);

        // Update room status
        setRentals(prevRentals => {
            return prevRentals.map(rental => {
                if (rental.id === data.rentalId) {
                    return {
                        ...rental,
                        rooms: rental.rooms.map(room => {
                            if (room.id === data.roomId) {
                                return { ...room, isOccupied: true };
                            }
                            return room;
                        })
                    }
                }
                return rental;
            })
        })

        toast({
            title: "Room Assigned!",
            description: `Room has been successfully assigned.`
        });
        form.reset();
    }

    return (
        <AppLayout>
             <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Assign Room to Client</CardTitle>
                        <CardDescription>Select a client, rental, and an available room to create an assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAssignRoom)} className="grid md:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rental Property</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); form.setValue('roomId', ''); }} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a rental" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {rentals.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="roomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Available Room</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedRentalId || availableRooms.length === 0}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableRooms.map(room => (
                                                        <SelectItem key={room.id} value={room.id!}>{room.roomNumber} ({room.roomType})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full">Assign Room</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
             </div>
        </AppLayout>
    )
}
