
'use client'

import { useState, useEffect, useMemo } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, BedDouble } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { addTenant } from '@/app/actions';
import { getTenants } from '@/lib/api/tenants';
import Link from 'next/link';
import { format } from 'date-fns';

type TenantFormValues = z.infer<typeof tenantSchema>;


export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    async function fetchTenants() {
        const fetchedTenants = await getTenants();
        setTenants(fetchedTenants);
    }

    useEffect(() => {
        fetchTenants();
    }, []);

    const { assignedTenants, unassignedTenants } = useMemo(() => {
        const assigned: Tenant[] = [];
        const unassigned: Tenant[] = [];
        tenants.forEach(tenant => {
            if (tenant.rentalName) {
                assigned.push(tenant);
            } else {
                unassigned.push(tenant);
            }
        });
        return { assignedTenants: assigned, unassignedTenants: unassigned };
    }, [tenants]);

    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            firstName: '',
            secondName: '',
            thirdName: '',
            idNumber: '',
            phone: '',
            email: '',
            maritalStatus: 'Single',
            gender: 'Male',
        }
    })

    const handleAddTenant = async (data: TenantFormValues) => {
        try {
            const result = await addTenant(data);
            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: "Tenant Registered",
                description: `${data.firstName} ${data.secondName} has been added to the tenant list.`
            });
            form.reset();
            setIsDialogOpen(false);
            await fetchTenants();
            router.refresh(); // reloads server components
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: error.message || "Failed to add tenant."
            })
        }
    }

    return (
        <AppLayout>
             <div className="space-y-4 md:space-y-8">
                <div className="flex items-center justify-between">
                    <div className="grid gap-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">Tenants</CardTitle>
                        <CardDescription>View and manage all registered tenants.</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2" />
                                Add New Tenant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                <DialogTitle>Register New Tenant</DialogTitle>
                                <DialogDescription>
                                    Add a new tenant to your system. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddTenant)} className="space-y-4 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g. John" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="secondName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Second Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="thirdName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Third Name (Optional)</FormLabel>
                                                    <FormControl><Input placeholder="e.g. Smith" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                        <FormField
                                        control={form.control}
                                        name="idNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ID / Passport Number</FormLabel>
                                                <FormControl><Input placeholder="e.g. 12345678" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="maritalStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Marital Status</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Single">Single</SelectItem>
                                                            <SelectItem value="Married">Married</SelectItem>
                                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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

                <Accordion type="multiple" className="grid gap-4 md:gap-8 lg:grid-cols-2 lg:items-start">
                    <AccordionItem value="assigned-tenants" className="border-0">
                        <Card>
                            <AccordionTrigger className="hover:no-underline">
                                <CardHeader className="w-full text-left p-6">
                                    <CardTitle>Assigned Tenants</CardTitle>
                                    <CardDescription>Tenants who are currently occupying a room.</CardDescription>
                                </CardHeader>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent>
                                   <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Full Name</TableHead>
                                                <TableHead>Assigned Property</TableHead>
                                                <TableHead>Room & Rent</TableHead>
                                                <TableHead>Next Payment Due</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignedTenants.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} className="text-center h-24">No tenants have been assigned rooms yet.</TableCell></TableRow>
                                             ) : (
                                                assignedTenants.map(tenant => (
                                                    <TableRow key={tenant.id}>
                                                        <TableCell className="font-medium">{`${tenant.firstName} ${tenant.secondName} ${tenant.thirdName || ''}`.trim()}</TableCell>
                                                        <TableCell>{tenant.rentalName}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{tenant.roomNumber}</span>
                                                                <span className="text-xs text-muted-foreground">KSh {tenant.rent?.toLocaleString()}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {tenant.nextPaymentDue ? format(new Date(tenant.nextPaymentDue), 'PPP') : '---'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                   </Table>
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>

                    <AccordionItem value="unassigned-tenants" className="border-0">
                        <Card>
                             <AccordionTrigger className="hover:no-underline">
                                <CardHeader className="w-full text-left p-6">
                                    <CardTitle>Unassigned Tenants</CardTitle>
                                    <CardDescription>Tenants who are registered but not yet assigned to a room.</CardDescription>
                                </CardHeader>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent>
                                   <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Full Name</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {unassignedTenants.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} className="text-center h-24">All tenants are assigned to rooms.</TableCell></TableRow>
                                             ) : (
                                                unassignedTenants.map(tenant => (
                                                    <TableRow key={tenant.id}>
                                                        <TableCell className="font-medium">{`${tenant.firstName} ${tenant.secondName} ${tenant.thirdName || ''}`.trim()}</TableCell>
                                                        <TableCell>{tenant.phone}</TableCell>
                                                        <TableCell>{tenant.email}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href="/assignments">
                                                                    <BedDouble className="mr-2 h-4 w-4" />
                                                                    Assign a Room
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                             )}
                                        </TableBody>
                                   </Table>
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                </Accordion>
             </div>
        </AppLayout>
    );
}
