
'use client'

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tenantSchema } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: ''
        }
    })

    const handleAddTenant = (data: TenantFormValues) => {
        const newTenant: Tenant = {
            ...data,
            id: new Date().getTime().toString(),
        }
        setTenants(prev => [...prev, newTenant]);
        toast({
            title: "Tenant Registered",
            description: `${newTenant.name} has been added to the tenant list.`
        });
        form.reset();
        setIsDialogOpen(false);
    }

    return (
        <AppLayout>
             <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Tenant List</CardTitle>
                            <CardDescription>View and manage all registered tenants.</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2" />
                                        Add New Tenant
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                     <DialogHeader>
                                        <DialogTitle>Register New Tenant</DialogTitle>
                                        <DialogDescription>
                                            Add a new tenant to your system. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleAddTenant)} className="space-y-4 py-4">
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
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">Cancel</Button>
                                                </DialogClose>
                                                <Button type="submit">Register Tenant</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
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
                                {tenants.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No tenants registered yet.</TableCell></TableRow>}
                                {tenants.map(tenant => (
                                    <TableRow key={tenant.id}>
                                        <TableCell className="font-medium">{tenant.name}</TableCell>
                                        <TableCell>{tenant.phone}</TableCell>
                                        <TableCell>{tenant.email}</TableCell>
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
