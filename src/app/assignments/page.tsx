
'use client'

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tenant, Rental } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assignmentSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignRoomToTenant } from '@/lib/api/rentals';
import { useRouter } from 'next/navigation';

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

// Mock Data
const mockTenants: Tenant[] = [
    { id: '1', firstName: 'John', secondName: 'Doe', thirdName: 'M', idNumber: '12345678', phone: '0712345678', email: 'john.doe@email.com', maritalStatus: 'Single', gender: 'Male' },
    { id: '2', firstName: 'Jane', secondName: 'Smith', thirdName: 'F', idNumber: '87654321', phone: '0787654321', email: 'jane.smith@email.com', maritalStatus: 'Married', gender: 'Female' },
];

const mockRentals: Rental[] = [
    { 
        id: '1', 
        name: 'Green Valley Apartments', 
        location: 'Kilimani, Nairobi', 
        ownerName: 'Peter Pan', 
        ownerNumber: '0711223344', 
        rooms: [
            { id: '101', roomNumber: 'A101', roomType: '1 Bedroom', rent: 25000, isOccupied: false },
            { id: '102', roomNumber: 'A102', roomType: 'Bedsitter', rent: 15000, isOccupied: true },
        ] 
    },
    { 
        id: '2', 
        name: 'Sunrise Towers', 
        location: 'Westlands, Nairobi', 
        ownerName: 'Wendy Darling', 
        ownerNumber: '0755667788', 
        rooms: [
            { id: '201', roomNumber: 'B201', roomType: '2 Bedroom', rent: 40000, isOccupied: false },
        ] 
    },
];


export default function AssignmentsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tenants] = useState<Tenant[]>(mockTenants);
    const [rentals] = useState<Rental[]>(mockRentals);

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            tenantId: '',
            rentalId: '',
            roomId: ''
        }
    })

    const selectedRentalId = form.watch('rentalId');

    const availableRooms = useMemo(() => {
        if (!selectedRentalId) return [];
        const rental = rentals.find(r => r.id.toString() === selectedRentalId);
        return rental ? rental.rooms.filter(room => !room.isOccupied) : [];
    }, [selectedRentalId, rentals]);

    const handleAssignRoom = async (data: AssignmentFormValues) => {
        try {
            // In a real app, you'd call an API function here.
            // await assignRoomToTenant(data.roomId, data.tenantId);
            console.log("Assigning room:", data);
            toast({
                title: "Room Assigned!",
                description: `Room has been successfully assigned (simulation).`
            });
            form.reset();
            router.refresh();

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: `Failed to assign room.`
            });
        }
    }

    return (
        <AppLayout>
             <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Assign Room to Tenant</CardTitle>
                        <CardDescription>Select a tenant, rental, and an available room to create an assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAssignRoom)} className="grid md:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="tenantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tenant</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a tenant" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tenants.map(c => <SelectItem key={c.id} value={c.id.toString()}>{`${c.firstName} ${c.secondName}`}</SelectItem>)}
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
                                                    {rentals.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
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
                                                    <SelectTrigger><SelectValue placeholder="Select a room" /></SelectValue>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableRooms.map(room => (
                                                        <SelectItem key={room.id} value={room.id!.toString()}>{room.roomNumber} ({room.roomType})</SelectItem>
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
