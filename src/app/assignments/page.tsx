
'use client'

import { useState, useMemo, useEffect, Suspense } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { getTenants } from '@/lib/api/tenants';
import { getRentals } from '@/lib/api/rentals';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';


type AssignmentFormValues = z.infer<typeof assignmentSchema>;

function AssignmentComponent() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('status') === 'success') {
            setShowSuccessAlert(true);
            const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
            // clean up search params
            router.replace('/assignments', undefined);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);


    useEffect(() => {
        async function fetchData() {
            try {
                const [fetchedTenants, fetchedRentals] = await Promise.all([
                    getTenants(),
                    getRentals()
                ]);
                setTenants(fetchedTenants);
                setRentals(fetchedRentals);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: "Failed to load rentals and tenants."
                });
            }
        }
        fetchData();
    }, [toast]);
    
    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            tenantId: '',
            rentalId: '',
            roomId: ''
        }
    });

    const selectedRentalId = form.watch('rentalId');
    const selectedTenantId = form.watch('tenantId');
    const selectedRoomId = form.watch('roomId');


    const availableRooms = useMemo(() => {
        if (!selectedRentalId) return [];
        const rental = rentals.find(r => r.id.toString() === selectedRentalId);
        return rental ? rental.rooms.filter(room => !room.isOccupied) : [];
    }, [selectedRentalId, rentals]);
    
    const handleProceedToPayment = () => {
        if(!selectedTenantId || !selectedRentalId || !selectedRoomId) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Please select a tenant, rental, and room."
            });
            return;
        }

        const rental = rentals.find(r => r.id.toString() === selectedRentalId);
        const room = availableRooms.find(rm => rm.id.toString() === selectedRoomId);
        const tenant = tenants.find(t => t.id.toString() === selectedTenantId);

        if (!rental || !room || !tenant) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not find the selected tenant, rental or room."
            });
            return;
        }

        const params = new URLSearchParams({
            tenantId: tenant.id,
            tenantName: `${tenant.firstName} ${tenant.secondName}`,
            rentalId: rental.id,
            rentalName: rental.name,
            roomId: room.id,
            roomNumber: room.roomNumber,
            rent: room.rent.toString(),
            phone: tenant.phone
        });

        router.push(`/payments/new?${params.toString()}`);
    }

    const isFormComplete = selectedTenantId && selectedRentalId && selectedRoomId;

    return (
        <AppLayout>
             <div className="grid flex-1 items-start gap-4 md:gap-8">
                {showSuccessAlert && (
                     <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600">
                        <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Assignment Successful!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            The payment was processed and the room has been assigned to the tenant.
                        </AlertDescription>
                    </Alert>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Assign Room to Tenant</CardTitle>
                        <CardDescription>Select a tenant, rental, and an available room to create an assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-4 gap-6">
                            <Form {...form}>
                                <FormField
                                    control={form.control}
                                    name="tenantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tenant</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                            <Select onValueChange={(value) => { field.onChange(value); form.setValue('roomId', ''); }} value={field.value}>
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
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRentalId || availableRooms.length === 0}>
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
                            </Form>
                             <div className="flex items-end">
                                <Button onClick={handleProceedToPayment} className="w-full" disabled={!isFormComplete}>
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </AppLayout>
    )
}

export default function AssignmentsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AssignmentComponent />
        </Suspense>
    )
}
