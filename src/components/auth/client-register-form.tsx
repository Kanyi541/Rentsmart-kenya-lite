
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
import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

const registerSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    secondName: z.string().min(2, "Second name is required"),
    idNumber: z.string().min(5, "A valid ID or Passport Number is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    email: z.string().email("A valid email is required"),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    gender: z.enum(['Male', 'Female']),
    nextOfKinName: z.string().optional().or(z.literal('')),
    nextOfKinPhone: z.string().optional().or(z.literal('')),
    nextOfKinRelationship: z.string().optional().or(z.literal('')),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function ClientRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
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

    useEffect(() => {
        if (timeLeft === 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const canSubmit = timeLeft === 0 && isAgreed;

    const onSubmit = async (data: RegisterFormValues) => {
        setIsSubmitting(true);
        try {
            await register(data as any);
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
                    
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold">Tenant Agreement & Data Privacy</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please take a moment to review our terms and conditions before proceeding.
                                </p>
                            </div>
                        </div>

                        <ScrollArea className="h-32 w-full rounded-md border bg-muted/50 p-3 text-sm">
                           <h4 className="font-bold mb-2">Tenant Agreement</h4>
                            <p className="mb-4">This placeholder text represents the full tenant lease agreement. It outlines the responsibilities of both the tenant and the landlord, including rent payment schedules, property rules, maintenance procedures, and conditions for lease termination. By agreeing, you confirm you have read and understood these terms.</p>
                            <h4 className="font-bold mb-2">Data Privacy Policy</h4>
                            <p>This placeholder outlines how we collect, use, and protect your personal information, such as your name, contact details, and ID number. We are committed to safeguarding your data in compliance with relevant laws. By agreeing, you consent to our data practices as described.</p>
                        </ScrollArea>
                        
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="agree-terms" 
                                checked={isAgreed}
                                onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                                disabled={timeLeft > 0}
                            />
                            <Label htmlFor="agree-terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I have read and agree to the Tenant Agreement and Data Privacy Policy.
                            </Label>
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                     <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : timeLeft > 0 ? (
                             <span>Please wait {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)} to agree</span>
                        ) : (
                            'Register'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
