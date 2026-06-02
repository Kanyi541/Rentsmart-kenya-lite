
'use client'

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { processPaymentAndAssign } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare const PaystackPop: any;

const paymentFormSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required e.g 07..."),
  email: z.string().email("A valid email is required to receive your receipt"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

function NewPaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { orgId } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Read details from URL
    const tenantId = searchParams.get('tenantId') || '';
    const tenantName = searchParams.get('tenantName') || '';
    const rentalId = searchParams.get('rentalId') || '';
    const rentalName = searchParams.get('rentalName') || '';
    const roomId = searchParams.get('roomId') || '';
    const roomNumber = searchParams.get('roomNumber') || '';
    const rent = Number(searchParams.get('rent')) || 0;
    const initialPhone = searchParams.get('phone') || '';
    const isRecurring = searchParams.get('type') === 'rent_only';
    
    const deposit = isRecurring ? 0 : rent / 2; 
    const total = rent + deposit;
    
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            phone: initialPhone,
            email: ''
        }
    });

    const handleProcessSuccess = async (reference: string, data: PaymentFormValues) => {
        try {
            const result = await processPaymentAndAssign({
                tenantId,
                rentalId,
                roomId,
                orgId: orgId!,
                rentAmount: rent,
                depositAmount: deposit,
                phone: data.phone,
                email: data.email,
                transactionRef: reference
            });

            if (result?.error) throw new Error(result.error);
            
            toast({ title: "Payment Verified!", description: `Transaction ${reference} processed successfully.` });
            
            if (isRecurring) {
                router.push('/clients');
            } else if (result.redirect) {
                router.push(result.redirect);
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Sync Error',
                description: "Payment was successful but we failed to update your record. Reference: " + reference
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handlePayment = (data: PaymentFormValues) => {
        setIsProcessing(true);
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

        if (!publicKey || publicKey.includes('your_public_key')) {
            toast({
                variant: 'destructive',
                title: "Configuration Error",
                description: "Paystack is not configured. Use the 'Simulate' option for now."
            });
            setIsProcessing(false);
            return;
        }

        const handler = PaystackPop.setup({
            key: publicKey,
            email: data.email,
            amount: total * 100, 
            currency: 'KES',
            phone: data.phone,
            metadata: {
                tenantId, rentalId, roomId, orgId,
                type: isRecurring ? 'Rent' : 'Assignment'
            },
            callback: (response: any) => handleProcessSuccess(response.reference, data),
            onClose: () => setIsProcessing(false)
        });

        handler.openIframe();
    };

    const handleSimulatedPayment = () => {
        const data = form.getValues();
        if (!data.email || data.phone.length < 10) {
            form.trigger();
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            handleProcessSuccess(`SIM_RENT_${Math.random().toString(36).substring(7).toUpperCase()}`, data);
        }, 1500);
    };

    if (!tenantId || !rentalId || !roomId || !orgId) {
        return (
             <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Invalid session or payment details. Please go back and try again.</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardFooter>
                </Card>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="flex justify-center items-start py-8">
                <Card className="w-full max-w-2xl shadow-lg border-primary/20">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePayment)}>
                            <CardHeader className="bg-primary/5 border-b mb-6">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-primary rounded-full">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    {isRecurring ? 'Pay Monthly Rent' : 'Secure Room Assignment'}
                                </CardTitle>
                                <CardDescription>Paystack Secure Gateway for {tenantName}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-lg bg-muted/20">
                                    <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Payment Summary</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <span className="text-muted-foreground">Property:</span>
                                        <span className="font-medium">{rentalName}</span>
                                        <span className="text-muted-foreground">Unit Number:</span>
                                        <span className="font-medium">Room {roomNumber}</span>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-card">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{isRecurring ? 'Current Month Rent' : "Initial Rent Payment"}:</span>
                                            <span className="font-medium">KSh {rent.toLocaleString()}</span>
                                        </div>
                                         {!isRecurring && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Refundable Deposit:</span>
                                                <span className="font-medium">KSh {deposit.toLocaleString()}</span>
                                            </div>
                                         )}
                                        <Separator />
                                         <div className="flex justify-between text-lg font-black text-primary pt-2">
                                            <span>Pay Now:</span>
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
                                                <FormLabel>E-receipt Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="tenant@email.com" {...field} />
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
                                                <FormLabel>M-Pesa / Mobile Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="07..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {(!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.includes('your_public_key')) && (
                                    <Alert className="bg-amber-50 border-amber-200">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                        <AlertDescription className="text-amber-800 text-xs">
                                            Paystack keys missing. Use <strong>Simulate</strong> below to test.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 p-2 rounded border border-green-100">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    <span>Encrypted with 256-bit SSL security via Paystack.</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t pt-6">
                                <div className="flex justify-between w-full">
                                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isProcessing}>Cancel</Button>
                                    <Button type="submit" size="lg" className="px-8 font-bold" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Authorize Payment'}
                                    </Button>
                                </div>
                                <Button variant="link" type="button" className="text-xs text-muted-foreground" onClick={handleSimulatedPayment} disabled={isProcessing}>
                                    Simulate Success (Dev)
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
        <Suspense fallback={<div>Loading Checkout Gateway...</div>}>
            <NewPaymentPage />
        </Suspense>
    )
}
