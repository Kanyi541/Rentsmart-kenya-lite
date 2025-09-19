
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import type { Tenant } from '@/lib/types';
import { updateTenantSchema } from '@/lib/schemas';

type UpdateTenantFormValues = z.infer<typeof updateTenantSchema>;

interface EditTenantFormProps {
    tenant: Tenant;
    onUpdate: (data: UpdateTenantFormValues) => Promise<void>;
}

export function EditTenantForm({ tenant, onUpdate }: EditTenantFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateTenantFormValues>({
        resolver: zodResolver(updateTenantSchema),
        defaultValues: {
            firstName: tenant.firstName || '',
            secondName: tenant.secondName || '',
            phone: tenant.phone || '',
            maritalStatus: tenant.maritalStatus || 'Single',
            gender: tenant.gender || 'Male',
            nextOfKinName: tenant.nextOfKinName || '',
            nextOfKinPhone: tenant.nextOfKinPhone || '',
            nextOfKinRelationship: tenant.nextOfKinRelationship || '',
        },
    });

    const onSubmit = async (data: UpdateTenantFormValues) => {
        setIsSubmitting(true);
        await onUpdate(data);
        setIsSubmitting(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
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
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" value={tenant.email} disabled /></FormControl>
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </FormItem>
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
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Emergency / Next of Kin Details</h3>
                    <FormField
                        control={form.control}
                        name="nextOfKinName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Next of Kin Full Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="nextOfKinPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Next of Kin Phone</FormLabel>
                                    <FormControl><Input placeholder="e.g. 0712345678" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nextOfKinRelationship"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Relationship</FormLabel>
                                    <FormControl><Input placeholder="e.g. Spouse, Sibling" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
