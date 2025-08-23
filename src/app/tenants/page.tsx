
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type TenantFormValues = z.infer<typeof tenantSchema>;


export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            firstName: '',
            secondName: '',
            thirdName: '',
            idNumber: '',
            phone: '',
            email: ''
        }
    })

    const handleAddTenant = (data: TenantFormValues) => {
        try {
            const newTenant = { ...data, id: new Date().getTime().toString() };
            setTenants(prev => [...prev, newTenant as Tenant]);

            toast({
                title: "Tenant Registered",
                description: `${data.firstName} ${data.secondName} has been added to the tenant list.`
            });
            form.reset();
            setIsDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to add tenant."
            })
        }
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
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>ID Number</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Marital Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No tenants registered yet.</TableCell></TableRow> :
                                tenants.map(tenant => (
                                    <TableRow key={tenant.id}>
                                        <TableCell className="font-medium">{`${tenant.firstName} ${tenant.secondName} ${tenant.thirdName || ''}`.trim()}</TableCell>
                                        <TableCell>{tenant.idNumber}</TableCell>
                                        <TableCell>{tenant.phone}</TableCell>
                                        <TableCell><Badge variant="outline">{tenant.gender}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{tenant.maritalStatus}</Badge></TableCell>
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
