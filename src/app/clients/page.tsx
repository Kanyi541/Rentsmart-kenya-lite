
'use client'

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import withAuth from '@/components/auth/with-auth';
import { useAuth } from '@/hooks/use-auth';

function ClientPage() {
    const { user } = useAuth();

    return (
        <AppLayout>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Dashboard</CardTitle>
                        <CardDescription>Welcome to your personal dashboard, {user?.email}. Here you can view your details, make payments, and more.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>More features coming soon!</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

export default withAuth(ClientPage);
