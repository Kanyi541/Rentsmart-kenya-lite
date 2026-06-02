
'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { CreditCard, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { activateSubscription } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import withAuth from '@/components/auth/with-auth';

function SubscriptionCheckoutPage() {
    const { organization, orgId, logout } = useAuth();
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

    const handlePayment = async () => {
        if (!orgId) return;
        setIsProcessing(true);
        
        // Simulate external payment gateway processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await activateSubscription(orgId);
            if (res.error) throw new Error(res.error);

            toast({
                title: "Payment Successful!",
                description: `Welcome to RentSmart! Your ${currentPlan} plan is now active.`,
            });
            router.push('/admin/dashboard');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Payment Failed",
                description: "We couldn't process your subscription payment. Please try again."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!organization) return null;

    return (
        <AppLayout>
            <div className="flex justify-center items-center py-12">
                <Card className="w-full max-w-lg shadow-xl border-t-4 border-primary">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Complete Your Subscription</CardTitle>
                        <CardDescription>
                            Confirm your organization details and pay to activate your management tools.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-medium">Organization:</span>
                                <span className="font-bold">{organization.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground font-medium">Selected Plan:</span>
                                <Badge variant="default" className="font-bold">{organization.plan}</Badge>
                            </div>
                             <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-lg font-bold">Amount Due:</span>
                                <span className="text-2xl font-black text-primary">KSh {price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                What's included in {organization.plan}:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    {organization.plan === 'Starter' ? '1 Property limit' : organization.plan === 'Growth' ? 'Up to 5 properties' : 'Unlimited properties'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Tenant management & Billing
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Secure cloud storage
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button className="w-full h-12 text-lg font-bold shadow-lg" onClick={handlePayment} disabled={isProcessing}>
                            {isProcessing ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authorizing...</>
                            ) : (
                                `Pay KSh ${price.toLocaleString()} & Activate`
                            )}
                        </Button>
                        <Button variant="ghost" className="text-muted-foreground text-xs" onClick={logout} disabled={isProcessing}>
                            Cancel & Sign Out
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}

export default withAuth(SubscriptionCheckoutPage);
