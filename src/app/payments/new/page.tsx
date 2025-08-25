
'use client'

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { processPaymentAndAssign } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

declare global {
    interface Window {
        PaystackPop: any;
    }
}

const paymentFormSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required e.g 254..."),
  email: z.string().email("A valid email is required to receive receipts"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

function NewPaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    // Read details from URL
    const tenantId = searchParams.get('tenantId') || '';
    const tenantName = searchParams.get('tenantName') || '';
    const rentalId = searchParams.get('rentalId') || '';
    const rentalName = searchParams.get('rentalName') || '';
    const roomId = searchParams.get('roomId') || '';
    const roomNumber = searchParams.get('roomNumber') || '';
    const rent = Number(searchParams.get('rent')) || 0;
    const initialPhone = searchParams.get('phone') || '';
    
    // Deposit is half the rent
    const deposit = rent / 2; 
    const total = rent + deposit;
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            phone: initialPhone,
            email: ''
        }
    });
    
    const { isSubmitting } = form.formState;

    if (!tenantId || !rentalId || !roomId) {
        return (
             <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Invalid payment details provided. Please go back to the assignments page and try again.</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button onClick={() => router.push('/assignments')}>Go Back</Button>
                    </CardFooter>
                </Card>
            </AppLayout>
        )
    }

    if (!paystackKey) {
        return (
             <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration Error</CardTitle>
                        <CardDescription>Paystack public key is not configured. Please contact support.</CardDescription>
                    </CardHeader>
                </Card>
            </AppLayout>
        )
    }
    
    const handlePayment = async (data: PaymentFormValues) => {
        const handler = window.PaystackPop.setup({
            key: paystackKey,
            email: data.email,
            amount: total * 100, // Paystack amount is in kobo (or cents)
            currency: 'KES', // Add the currency here
            phone: data.phone,
            ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference.
            onClose: function(){
                toast({
                    variant: 'destructive',
                    title: 'Payment Incomplete',
                    description: "You closed the payment popup. Please try again."
                });
            },
            callback: function(response: any){
                // This callback is where you would ideally verify the transaction on your server.
                // For now, we will optimistically proceed.
                form.control.handleSubmit(async () => {
                     try {
                        const result = await processPaymentAndAssign({
                            tenantId,
                            rentalId,
                            roomId,
                            rentAmount: rent,
                            depositAmount: deposit,
                            phone: data.phone,
                            email: data.email,
                            transactionRef: response.reference
                        });

                        if (result?.error) {
                            throw new Error(result.error);
                        }
                        // Redirect is handled by the server action
                    } catch (error: any) {
                         toast({
                            variant: 'destructive',
                            title: 'Assignment Failed',
                            description: error.message || "An unexpected error occurred after payment."
                        })
                    }
                })();
            }
        });
        handler.openIframe();
    };


    return (
        <AppLayout>
            <div className="flex justify-center items-start py-8">
                <Card className="w-full max-w-2xl">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePayment)}>
                            <CardHeader>
                                <CardTitle>Complete Room Assignment</CardTitle>
                                <CardDescription>Confirm payment details to finalize the assignment for {tenantName}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <h3 className="font-semibold mb-2">Assignment Summary</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                        <span className="text-muted-foreground">Tenant:</span>
                                        <span>{tenantName}</span>
                                        <span className="text-muted-foreground">Property:</span>
                                        <span>{rentalName}</span>
                                        <span className="text-muted-foreground">Room:</span>
                                        <span>{roomNumber}</span>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-4">Payment Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">First Month's Rent:</span>
                                            <span className="font-medium">KSh {rent.toLocaleString()}</span>
                                        </div>
                                         <div className="flex justify-between">
                                            <span className="text-muted-foreground">Security Deposit:</span>
                                            <span className="font-medium">KSh {deposit.toLocaleString()}</span>
                                        </div>
                                        <Separator />
                                         <div className="flex justify-between text-base font-bold">
                                            <span>Total Amount Due:</span>
                                            <span>KSh {total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email for Receipt</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="e.g. tenant@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g 254712345678" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {isSubmitting && (
                                     <div className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        <p className="font-semibold text-blue-700 dark:text-blue-300">Processing Payment...</p>
                                        <p className="text-sm text-muted-foreground">Please wait while we confirm your payment of KSh {total.toLocaleString()}.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : `Pay KSh ${total.toLocaleString()}`}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}


export default function NewPaymentPageWrapper() {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <NewPaymentPage />
        </Suspense>
    )
}
