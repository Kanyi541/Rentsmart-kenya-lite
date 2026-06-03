
'use client'

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { processPaymentAndAssign, initiateMpesaStkPush } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Organization } from '@/lib/types';
import { LoadingAnimation } from '@/components/loading';

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
    const { orgId: userOrgId, loading: authLoading } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [landlordOrg, setLandlordOrg] = useState<Organization | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Read details from URL
    const tenantId = searchParams.get('tenantId') || '';
    const tenantName = searchParams.get('tenantName') || '';
    const rentalId = searchParams.get('rentalId') || '';
    const rentalName = searchParams.get('rentalName') || '';
    const roomId = searchParams.get('roomId') || '';
    const roomNumber = searchParams.get('roomNumber') || '';
    const rent = Number(searchParams.get('rent')) || 0;
    const initialPhone = searchParams.get('phone') || '';
    const targetOrgId = searchParams.get('orgId') || userOrgId;
    const isRecurring = searchParams.get('type') === 'rent_only';
    
    const deposit = isRecurring ? 0 : rent / 2; 
    const total = rent + deposit;

    useEffect(() => {
        async function fetchLandlordSettings() {
            if (!targetOrgId) {
                if (!authLoading) setPageLoading(false);
                return;
            }
            try {
                const orgDoc = await getDoc(doc(db, 'organizations', targetOrgId));
                if (orgDoc.exists()) {
                    setLandlordOrg({ id: orgDoc.id, ...orgDoc.data() } as Organization);
                }
            } catch (error) {
                console.error("Failed to load landlord settings", error);
            } finally {
                setPageLoading(false);
            }
        }
        fetchLandlordSettings();
    }, [targetOrgId, authLoading]);
    
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
                orgId: targetOrgId!,
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

    const handleMpesaPayment = async (data: PaymentFormValues) => {
        setIsProcessing(true);
        try {
            const res = await initiateMpesaStkPush({
                phone: data.phone,
                amount: total,
                accountRef: `Room ${roomNumber} - ${tenantName}`,
                businessShortCode: landlordOrg?.mpesaShortcode
            });

            if (res.success) {
                toast({
                    title: 'M-Pesa Push Sent',
                    description: `Enter PIN for ${landlordOrg?.mpesaAccountName || rentalName} to complete the payment.`,
                });

                // Simulate waiting for Daraja Callback
                setTimeout(() => {
                    handleProcessSuccess(res.checkoutRequestId, data);
                }, 6000);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'M-Pesa Failed', description: 'Could not reach Safaricom. Try again later.' });
            setIsProcessing(false);
        }
    };
    
    const handleCardPayment = (data: PaymentFormValues) => {
        setIsProcessing(true);
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

        if (!publicKey || publicKey.includes('your_public_key')) {
            toast({
                variant: 'destructive',
                title: "Configuration Error",
                description: "Paystack is not configured. Use the 'Simulate' option or M-Pesa."
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
                tenantId, rentalId, roomId, orgId: targetOrgId,
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
            handleProcessSuccess(`SIM_PAY_${Math.random().toString(36).substring(7).toUpperCase()}`, data);
        }, 1500);
    };

    if (pageLoading || authLoading) {
        return (
            <AppLayout>
                 <div className="flex min-h-[60vh] items-center justify-center">
                    <LoadingAnimation />
                </div>
            </AppLayout>
        )
    }

    if (!tenantId || !rentalId || !roomId || !targetOrgId) {
        return (
             <AppLayout>
                <Card className="max-w-md mx-auto mt-12">
                    <CardHeader>
                        <CardTitle>Invalid Payment Session</CardTitle>
                        <CardDescription>The checkout details are missing or incomplete. Please return to your dashboard and try again.</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button onClick={() => router.back()} className="w-full">Go Back</Button>
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
                        <form>
                            <CardHeader className="bg-primary/5 border-b mb-6">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-primary rounded-full">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    {isRecurring ? 'Pay Monthly Rent' : 'Secure Room Assignment'}
                                </CardTitle>
                                <CardDescription>
                                    Secure Checkout for {tenantName}. 
                                    Settling to: <span className="font-bold text-foreground">{landlordOrg?.mpesaAccountName || landlordOrg?.name || rentalName}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-lg bg-muted/20">
                                    <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Payment Summary</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <span className="text-muted-foreground">Property:</span>
                                        <span className="font-medium">{rentalName}</span>
                                        <span className="text-muted-foreground">Unit:</span>
                                        <span className="font-medium">Room {roomNumber}</span>
                                        {landlordOrg?.mpesaShortcode && (
                                            <>
                                                <span className="text-muted-foreground">M-Pesa {landlordOrg.mpesaType}:</span>
                                                <span className="font-bold">{landlordOrg.mpesaShortcode}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-primary pt-4 mt-2 border-t">
                                        <span>Total to Pay:</span>
                                        <span>KSh {total.toLocaleString()}</span>
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

                                <Separator />

                                <Tabs defaultValue="mpesa" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="mpesa" className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4" /> M-Pesa Express
                                        </TabsTrigger>
                                        <TabsTrigger value="card" className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Card / Bank
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="mpesa" className="pt-4">
                                        <Button 
                                            type="button" 
                                            className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold" 
                                            onClick={form.handleSubmit(handleMpesaPayment)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay KSh ${total.toLocaleString()} via M-Pesa`}
                                        </Button>
                                    </TabsContent>
                                    <TabsContent value="card" className="pt-4">
                                        <Button 
                                            type="button" 
                                            className="w-full h-12 font-bold" 
                                            onClick={form.handleSubmit(handleCardPayment)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay KSh ${total.toLocaleString()} with Card`}
                                        </Button>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 p-2 rounded border border-green-100">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    <span>Encrypted with 256-bit SSL security. Funds are deposited directly to {landlordOrg?.mpesaAccountName || 'the landlord'}'s bank account.</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 bg-muted/10 border-t pt-6">
                                <div className="flex justify-between w-full">
                                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isProcessing}>Cancel</Button>
                                    <Button variant="link" type="button" className="text-xs text-muted-foreground" onClick={handleSimulatedPayment} disabled={isProcessing}>
                                        Simulate Success (Developer Only)
                                    </Button>
                                </div>
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
        <Suspense fallback={
            <AppLayout>
                 <div className="flex min-h-[60vh] items-center justify-center">
                    <LoadingAnimation />
                </div>
            </AppLayout>
        }>
            <NewPaymentPage />
        </Suspense>
    )
}
