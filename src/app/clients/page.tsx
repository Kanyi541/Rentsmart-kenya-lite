
'use client'

import { AppLayout } from '@/components/app-layout';
import withAuth from '@/components/auth/with-auth';
import { ClientDashboard } from '@/components/client-dashboard';

function ClientPage() {
    return (
        <AppLayout>
           <ClientDashboard />
        </AppLayout>
    )
}

export default withAuth(ClientPage);
