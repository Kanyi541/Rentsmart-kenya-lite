'use client'

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Client } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const { toast } = useToast();

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: ''
        }
    })

    const handleAddClient = (data: ClientFormValues) => {
        const newClient: Client = {
            ...data,
            id: new Date().getTime().toString(),
        }
        setClients(prev => [...prev, newClient]);
        toast({
            title: "Client Registered",
            description: `${newClient.name} has been added to the client list.`
        });
        form.reset();
    }

    return (
        <AppLayout>
             <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Register New Client</CardTitle>
                            <CardDescription>Add a new client to your system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddClient)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl><Input placeholder="e.g. Jane Smith" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl><Input placeholder="e.g. 0798765432" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input type="email" placeholder="e.g. user@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">Register Client</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 grid auto-rows-max items-start gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client List</CardTitle>
                             <CardDescription>View and manage all registered clients.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No clients registered yet.</TableCell></TableRow>}
                                    {clients.map(client => (
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell>{client.phone}</TableCell>
                                            <TableCell>{client.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>
             </div>
        </AppLayout>
    )
}
