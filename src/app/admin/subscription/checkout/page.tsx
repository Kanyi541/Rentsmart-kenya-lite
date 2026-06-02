
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { CreditCard, Loader2, ShieldCheck, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { activateSubscription } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import withAuth from '@/components/auth/with-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare const PaystackPop: any;

function SubscriptionCheckoutPage() {
    const { organization, user, orgId, logout } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const planPrices = {
        'Starter': 2999,
        'Growth': 4999,
        'Scale': 9999
    };

    const currentPlan = organization?.plan || 'Starter';
    const price = planPrices[currentPlan as keyof typeof planPrices];

    const handleActivationSuccess = async (reference: string) => {
        try {
            const res = await activateSubscription(orgId!);
            if (res.error) throw new Error(res.error);

            toast({
                title: "Plan Activated!",
                description: `Welcome to RentSmart! Your ${currentPlan} plan is now active. Ref: ${reference}`,
            });
            router.push('/admin/dashboard');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Activation Failed",
                description: "Payment was successful but we couldn't activate your account. Please contact support."
            });
        } finally {
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
                description: "Please add your Paystack Public Key to .env. For now, use the 'Simulate Payment' option below.",
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
                plan: currentPlan,
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
        // Simulate a delay
        setTimeout(() => {
            handleActivationSuccess(`SIM_${Math.random().toString(36).substring(7).toUpperCase()}`);
        }, 1500);
    };

    if (!organization) return null;

    return (
        <AppLayout>
            <div className="flex justify-center items-center py-12">
                <Card className="w-full max-w-lg shadow-xl border-t-4 border-primary">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary">
                            <Zap className="h-8 w-8 fill-current" />
                        </div>
                        <CardTitle className="text-2xl">Activate Your Plan</CardTitle>
                        <CardDescription>
                            Complete payment to start managing your properties with {organization.name}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Selected Tier:</span>
                                <Badge variant="default" className="font-bold">{organization.plan}</Badge>
                            </div>
                             <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-lg font-bold">Total Amount:</span>
                                <span className="text-2xl font-black text-primary">KSh {price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                Tier Benefits:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    {organization.plan === 'Starter' ? '1 Property limit' : organization.plan === 'Growth' ? 'Up to 5 properties' : 'Unlimited properties'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    Tenant management & Automatic Billing
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    Secure cloud storage & M-Pesa integration
                                </li>
                            </ul>
                        </div>

                        {(!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.includes('your_public_key')) && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800 text-xs">
                                    Paystack keys not found. Use the <strong>Simulate Payment</strong> button below to bypass this for now.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button className="w-full h-12 text-lg font-bold shadow-lg" onClick={handlePaystackPayment} disabled={isProcessing}>
                            {isProcessing ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                `Pay KSh ${price.toLocaleString()} via Paystack`
                            )}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleSimulatedPayment} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simulate Payment (Development)"}
                        </Button>
                        <Button variant="ghost" className="text-muted-foreground text-xs" onClick={logout} disabled={isProcessing}>
                            Cancel Registration
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}

export default withAuth(SubscriptionCheckoutPage);
