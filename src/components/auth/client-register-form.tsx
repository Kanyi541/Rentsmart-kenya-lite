
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
import { useRouter } from 'next/navigation';
import { CardContent, CardFooter } from '../ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

const registerSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    secondName: z.string().min(2, "Second name is required"),
    idNumber: z.string().min(5, "A valid ID or Passport Number is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    email: z.string().email("A valid email is required"),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    gender: z.enum(['Male', 'Female']),
    nextOfKinName: z.string().min(3, "Next of Kin's name is required"),
    nextOfKinPhone: z.string().min(10, "A valid phone number is required for Next of Kin"),
    nextOfKinRelationship: z.string().min(3, "Relationship is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function ClientRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            secondName: '',
            idNumber: '',
            phone: '',
            email: '',
            password: '',
            maritalStatus: 'Single',
            gender: 'Male',
            nextOfKinName: '',
            nextOfKinPhone: '',
            nextOfKinRelationship: ''
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsSubmitting(true);
        try {
            await register(data);
            toast({
                title: 'Registration Successful',
                description: "Welcome! You can now log in.",
            });
            router.push('/clients/login');
        } catch (error: any) {
            console.error(error);
            const message = error.code === 'auth/email-already-in-use' 
                ? 'This email is already registered.' 
                : 'Registration failed. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
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
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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

                    <Separator />
                    
                    <div>
                        <h3 className="text-lg font-medium">Emergency / Next of Kin Details</h3>
                        <p className="text-sm text-muted-foreground">This information will be used in case of an emergency.</p>
                    </div>

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

                </CardContent>
                <CardFooter>
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Register
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
