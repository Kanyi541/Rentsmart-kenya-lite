'use client'

import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tenant, Rental, Room, Assignment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assignmentSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function AssignmentsPage({ rentals: initialRentals, tenants: initialTenants, onAssignRoom }: { rentals: Rental[], tenants: Tenant[], onAssignRoom: (roomId: string, rentalId: string) => void }) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
    const [rentals, setRentals] = useState<Rental[]>(initialRentals);
    const { toast } = useToast();

    useEffect(() => {
        setRentals(initialRentals);
    }, [initialRentals]);

    useEffect(() => {
        setTenants(initialTenants);
    }, [initialTenants]);

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
        const rental = rentals.find(r => r.id === selectedRentalId);
        return rental ? rental.rooms.filter(room => !room.isOccupied) : [];
    }, [selectedRentalId, rentals]);

    const handleAssignRoom = (data: AssignmentFormValues) => {
        try {
            onAssignRoom(data.roomId, data.rentalId);
            toast({
                title: "Room Assigned!",
                description: `Room has been successfully assigned.`
            });
            form.reset();

        } catch (error) {
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
                                                    {!tenants ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                                     tenants.map(c => <SelectItem key={c.id} value={c.id.toString()}>{`${c.firstName} ${c.secondName}`}</SelectItem>)}
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
                                                    {!rentals ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                                     rentals.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
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
