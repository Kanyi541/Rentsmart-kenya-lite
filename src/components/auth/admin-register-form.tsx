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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { CardContent, CardFooter } from '../ui/card';
import { useState } from 'react';
import { Loader2, Building2, ShieldCheck } from 'lucide-react';
import { useLoading } from '@/hooks/use-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const adminRegisterSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  organizationName: z.string().min(3, 'Organization name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  plan: z.enum(['Starter', 'Growth', 'Scale']),
});

type AdminRegisterValues = z.infer<typeof adminRegisterSchema>;

export function AdminRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { registerLandlord } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { startLoading, stopLoading } = useLoading();

    const initialPlan = searchParams.get('plan') as 'Starter' | 'Growth' | 'Scale' || 'Starter';

    const form = useForm<AdminRegisterValues>({
        resolver: zodResolver(adminRegisterSchema),
        defaultValues: {
            fullName: '',
            organizationName: '',
            email: '',
            password: '',
            plan: initialPlan,
        },
    });

    const onSubmit = async (data: AdminRegisterValues) => {
        setIsSubmitting(true);
        startLoading();
        try {
            await registerLandlord(data);
            toast({
                title: 'Welcome to RentSmart!',
                description: 'Your organization has been created. Redirecting to your dashboard.',
            });
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error(error);
            let description = 'Registration failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email is already registered.'
            }
            toast({
                variant: 'destructive',
                title: 'Registration Error',
                description: description,
            });
        } finally {
            setIsSubmitting(false);
            stopLoading();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Organization Name</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-8" placeholder="Elite Management" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Selected Plan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a plan" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Starter">Starter (1 Property)</SelectItem>
                                        <SelectItem value="Growth">Growth (5 Properties)</SelectItem>
                                        <SelectItem value="Scale">Scale (Unlimited)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="admin@organization.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-3 border">
                        <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                            By clicking register, you agree to our Terms of Service and set up a new {form.watch('plan')} subscription for your organization.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account & Start Trial
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
