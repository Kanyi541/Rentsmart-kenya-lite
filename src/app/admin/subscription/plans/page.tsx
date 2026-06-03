'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import withAuth from '@/components/auth/with-auth';

function SubscriptionPlansPage() {
    const { organization } = useAuth();
    const currentPlan = organization?.plan || 'Starter';

    const plans = [
        {
            name: 'Starter',
            price: '2,999',
            description: 'Essential toolkit for small portfolios.',
            features: ['1 Property Limit', 'Core Property Tools', 'Tenant Database'],
            isCurrent: currentPlan === 'Starter'
        },
        {
            name: 'Growth',
            price: '4,999',
            description: 'Advanced features for scaling professionals.',
            features: ['5 Properties Limit', 'Announcements & Complaints', 'Move-out Management'],
            isCurrent: currentPlan === 'Growth'
        },
        {
            name: 'Scale',
            price: '9,999',
            description: 'Unlimited management for large agencies.',
            features: ['Unlimited Properties', 'Priority Support', 'Full Feature Access'],
            isCurrent: currentPlan === 'Scale'
        }
    ];

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-8 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
                        <p className="text-muted-foreground">Manage your organization's features and limits.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={plan.isCurrent ? "border-primary shadow-md relative" : ""}>
                            {plan.isCurrent && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">
                                    Current Plan
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-3xl font-bold">KSh {plan.price}</span>
                                    <span className="text-muted-foreground text-sm">/month</span>
                                </div>
                                <CardDescription className="pt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {plan.isCurrent ? (
                                    <Button className="w-full" variant="secondary" disabled>
                                        Active
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full">
                                        <Link href={`/admin/subscription/checkout?upgradePlan=${plan.name}`}>
                                            {plan.name === 'Scale' || (plan.name === 'Growth' && currentPlan === 'Starter') ? 'Upgrade Plan' : 'Change Plan'}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <Card className="bg-muted/30 border-dashed">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-lg">Need a Custom Enterprise Solution?</CardTitle>
                            <CardDescription>We offer tailored packages for large real estate firms with over 1000 units.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-end">
                         <Button variant="outline">Contact Techivo Sales</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';

export default withAuth(SubscriptionPlansPage);