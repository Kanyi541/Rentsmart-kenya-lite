
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
import { CardContent, CardFooter } from '../ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { forgotPassword } = useAuth();
    const { toast } = useToast();

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsSubmitting(true);
        try {
            await forgotPassword(data.email);
            toast({
                title: 'Check Your Email',
                description: 'A password reset link has been sent to your email address.',
            });
        } catch (error: any) {
            console.error(error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to send reset link. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                    <Link href="/clients/login" passHref className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Back to Login
                    </Link>
                </CardFooter>
            </form>
        </Form>
    );
}
