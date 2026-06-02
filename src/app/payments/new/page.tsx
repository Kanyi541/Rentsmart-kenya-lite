
'use client'

import { Suspense, useState, useEffect } from 'react';
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
import { Loader2, AlertTriangle, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

const paymentFormSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required e.g 254..."),
  email: z.string().email("A valid email is required to receive receipts"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

function NewPaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { orgId } = useAuth();
    const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

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
    
    // Deposit is half the rent, only charged on initial assignment
    const deposit = isRecurring ? 0 : rent / 2; 
    const total = rent + deposit;
    
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            phone: initialPhone,
            email: ''
        }
    });
    
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
    
    const handleSimulatedPayment = async (data: PaymentFormValues) => {
        setIsSimulatingPayment(true);
        const transactionRef = 'SIMULATED_REF_' + Math.floor((Math.random() * 1000000000) + 1);

        try {
            const result = await processPaymentAndAssign({
                tenantId,
                rentalId,
                roomId,
                orgId,
                rentAmount: rent,
                depositAmount: deposit,
                phone: data.phone,
                email: data.email,
                transactionRef: transactionRef
            });

            if (result?.error) throw new Error(result.error);
            
            toast({ title: "Payment Successful!", description: `KSh ${total.toLocaleString()} has been received. Your records are being updated.` });
            
            if (isRecurring) {
                router.push('/clients');
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: error.message || "An unexpected error occurred."
            });
            setIsSimulatingPayment(false);
        }
    };

    return (
        <AppLayout>
            <div className="flex justify-center items-start py-8">
                <Card className="w-full max-w-2xl">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSimulatedPayment)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                    {isRecurring ? 'Rent Payment' : 'Complete Room Assignment'}
                                </CardTitle>
                                <CardDescription>Confirm details to process payment for {tenantName}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <Alert variant="destructive" className="bg-yellow-50 border-yellow-400 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4 !text-yellow-700" />
                                    <AlertTitle className="font-bold">Checkout Mode</AlertTitle>
                                    <AlertDescription>
                                        This is a simulated secure checkout. No real funds will be moved during this trial phase.
                                    </AlertDescription>
                                </Alert>

                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <h3 className="font-semibold mb-2">Checkout Summary</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                        <span className="text-muted-foreground">Resident:</span>
                                        <span>{tenantName}</span>
                                        <span className="text-muted-foreground">Property:</span>
                                        <span>{rentalName}</span>
                                        <span className="text-muted-foreground">Unit:</span>
                                        <span>Room {roomNumber}</span>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-4">Breakdown</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{isRecurring ? 'Monthly Rent' : "First Month's Rent"}:</span>
                                            <span className="font-medium">KSh {rent.toLocaleString()}</span>
                                        </div>
                                         {!isRecurring && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Security Deposit:</span>
                                                <span className="font-medium">KSh {deposit.toLocaleString()}</span>
                                            </div>
                                         )}
                                        <Separator />
                                         <div className="flex justify-between text-base font-bold">
                                            <span>Total Due Now:</span>
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
                                                <FormLabel>Receipt Email</FormLabel>
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
                                                <FormLabel>Mobile Money Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g 2547..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {isSimulatingPayment && (
                                     <div className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        <p className="font-semibold text-blue-700 dark:text-blue-300">Authorizing Payment...</p>
                                        <p className="text-sm text-muted-foreground">Verifying KSh {total.toLocaleString()} with provider.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => router.back()} disabled={isSimulatingPayment}>Cancel</Button>
                                <Button type="submit" disabled={isSimulatingPayment}>
                                    {isSimulatingPayment ? 'Verifying...' : `Pay KSh ${total.toLocaleString()}`}
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
        <Suspense fallback={<div>Loading checkout...</div>}>
            <NewPaymentPage />
        </Suspense>
    )
}
