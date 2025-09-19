
'use client'

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, BedDouble } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { addTenant } from '@/app/actions';
import { getTenants } from '@/lib/api/tenants';
import Link from 'next/link';

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    async function fetchTenants() {
        setLoading(true);
        try {
            const fetchedTenants = await getTenants();
            setTenants(fetchedTenants);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to load tenant data."
            })
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTenants();
    }, []);

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
            router.refresh();
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
                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions / Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">Loading tenants...</TableCell></TableRow>
                                ) : tenants.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No tenants registered yet.</TableCell></TableRow>
                                ) : (
                                    tenants.map(tenant => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">
                                                {`${tenant.firstName} ${tenant.secondName} ${tenant.thirdName || ''}`.trim()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{tenant.phone}</span>
                                                    <span className="text-xs text-muted-foreground">{tenant.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tenant.rentalName ? (
                                                    <Badge variant="default">Assigned</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Unassigned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {tenant.rentalName ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-semibold">{tenant.rentalName}</span>
                                                        <span className="text-sm text-muted-foreground">Room: {tenant.roomNumber}</span>
                                                    </div>
                                                ) : (
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href="/assignments">
                                                            <BedDouble className="mr-2 h-4 w-4" />
                                                            Assign a Room
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
        </AppLayout>
    );
}

