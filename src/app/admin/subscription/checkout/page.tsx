
'use client'

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { CreditCard, Loader2, ShieldCheck, CheckCircle2, Zap, ArrowUpCircle, Phone, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { activateSubscription, initiateMpesaStkPush } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import withAuth from '@/components/auth/with-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingAnimation } from '@/components/loading';

declare const PaystackPop: any;

function CheckoutContent() {
    const { organization, user, orgId, logout, loading } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [paymentMethod, setMpesaPaymentMethod] = useState<'mpesa' | 'card' | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const planPrices = {
        'Starter': 2999,
        'Growth': 4999,
        'Scale': 9999
    };

    const upgradePlan = searchParams.get('upgradePlan');
    const targetPlan = upgradePlan || organization?.plan || 'Starter';
    const isUpgrade = !!upgradePlan && upgradePlan !== organization?.plan;
    const price = planPrices[targetPlan as keyof typeof planPrices] || 2999;

    const handleActivationSuccess = async (reference: string) => {
        try {
            const res = await activateSubscription(orgId!, upgradePlan || undefined);
            if (res.error) throw new Error(res.error);

            toast({
                title: isUpgrade ? "Plan Upgraded!" : "Plan Activated!",
                description: `Your ${targetPlan} plan is now active. Ref: ${reference}`,
            });
            router.push('/admin/dashboard');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Activation Failed",
                description: "Payment was successful but we couldn't update your account. Please contact support."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMpesaPayment = async () => {
        if (!mpesaPhone || mpesaPhone.length < 10) {
            toast({ variant: 'destructive', title: 'Invalid Phone', description: 'Please enter a valid M-Pesa phone number.' });
            return;
        }

        setIsProcessing(true);
        try {
            const res = await initiateMpesaStkPush({
                phone: mpesaPhone,
                amount: price,
                accountRef: organization?.name || 'RentSmart Subscription'
            });

            if (res.success) {
                toast({
                    title: 'STK Push Sent!',
                    description: 'Check your phone to enter your M-Pesa PIN.',
                });
                
                // Simulate waiting for M-Pesa Callback
                setTimeout(() => {
                    handleActivationSuccess(res.checkoutRequestId);
                }, 5000);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'M-Pesa Error', description: 'Failed to initiate M-Pesa payment.' });
            setIsProcessing(false);
        }
    };

    const handlePaystackPayment = () => {
        if (!user?.email || !orgId) return;
        
        setIsProcessing(true);

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        
        if (!publicKey || publicKey.includes('your_public_key')) {
            toast({
                variant: 'destructive',
                title: "Paystack Not Configured",
                description: "Please add your Paystack Public Key to .env. For now, use the 'Simulate' button.",
            });
            setIsProcessing(false);
            return;
        }

        const handler = PaystackPop.setup({
            key: publicKey,
            email: user.email,
            amount: price * 100, 
            currency: 'KES',
            metadata: {
                orgId: orgId,
                plan: targetPlan,
                isUpgrade
            },
            callback: (response: any) => handleActivationSuccess(response.reference),
            onClose: () => {
                setIsProcessing(false);
                toast({
                    title: "Payment Cancelled",
                    description: "You closed the payment window."
                });
            }
        });

        handler.openIframe();
    };

    const handleSimulatedPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            handleActivationSuccess(`SIM_${Math.random().toString(36).substring(7).toUpperCase()}`);
        }, 1500);
    };

    if (loading || (!organization && orgId)) {
        return (
            <AppLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <LoadingAnimation />
                </div>
            </AppLayout>
        );
    }

    if (!organization && !loading) {
        return (
             <AppLayout>
                <Card className="max-w-md mx-auto mt-12">
                    <CardHeader>
                        <CardTitle>Session Expired</CardTitle>
                        <CardDescription>We couldn't retrieve your organization details. Please log in again.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={logout} className="w-full">Back to Login</Button>
                    </CardFooter>
                </Card>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="flex justify-center items-center py-12">
                <Card className="w-full max-w-lg shadow-xl border-t-4 border-primary">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary">
                            {isUpgrade ? <ArrowUpCircle className="h-8 w-8" /> : <Zap className="h-8 w-8 fill-current" />}
                        </div>
                        <CardTitle className="text-2xl">{isUpgrade ? 'Upgrade Subscription' : 'Activate Your Plan'}</CardTitle>
                        <CardDescription>
                            {isUpgrade 
                                ? `Confirm your upgrade to the ${targetPlan} plan for ${organization?.name}.`
                                : `Complete payment to start managing your properties with ${organization?.name}.`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Selected Tier:</span>
                                <Badge variant="default" className="font-bold">{targetPlan}</Badge>
                            </div>
                             <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-lg font-bold">Total Amount:</span>
                                <span className="text-2xl font-black text-primary">KSh {price.toLocaleString()}</span>
                            </div>
                        </div>

                        {!paymentMethod ? (
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 hover:border-primary" onClick={() => setMpesaPaymentMethod('mpesa')}>
                                    <Smartphone className="h-8 w-8 text-green-600" />
                                    <span>M-Pesa Express</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col gap-2 border-2 hover:border-primary" onClick={() => setMpesaPaymentMethod('card')}>
                                    <CreditCard className="h-8 w-8 text-blue-600" />
                                    <span>Card / Bank</span>
                                </Button>
                            </div>
                        ) : paymentMethod === 'mpesa' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="mpesa-phone" 
                                            placeholder="0712345678" 
                                            className="pl-10" 
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Funds will be deposited into our secure bank account via M-Pesa APIs.</p>
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold" onClick={handleMpesaPayment} disabled={isProcessing}>
                                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay KSh ${price.toLocaleString()} via M-Pesa`}
                                </Button>
                                <Button variant="ghost" className="w-full text-xs" onClick={() => setMpesaPaymentMethod(null)}>Change Payment Method</Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <Button className="w-full h-12 font-bold" onClick={handlePaystackPayment} disabled={isProcessing}>
                                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay KSh ${price.toLocaleString()} with Card`}
                                </Button>
                                <Button variant="ghost" className="w-full text-xs" onClick={() => setMpesaPaymentMethod(null)}>Change Payment Method</Button>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                {targetPlan} Benefits:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    {targetPlan === 'Starter' ? '1 Property limit' : targetPlan === 'Growth' ? 'Up to 5 properties' : 'Unlimited properties'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    Tenant management & Automatic Billing
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full" onClick={handleSimulatedPayment} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simulate Payment (Dev Mode)"}
                        </Button>
                        {!isUpgrade && (
                            <Button variant="ghost" className="text-muted-foreground text-xs" onClick={logout} disabled={isProcessing}>
                                Cancel Registration
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function SubscriptionCheckoutPage() {
    return (
        <Suspense fallback={
            <AppLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <LoadingAnimation />
                </div>
            </AppLayout>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
