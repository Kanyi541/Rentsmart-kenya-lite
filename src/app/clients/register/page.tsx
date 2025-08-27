
import { ClientRegisterForm } from '@/components/auth/client-register-form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function ClientRegisterPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Tenant Registration</CardTitle>
                    <CardDescription>Create your account to access the tenant portal.</CardDescription>
                </CardHeader>
                <ClientRegisterForm />
                 <CardDescription className="p-6 pt-0 text-center text-sm">
                    Already have an account? <Link href="/clients/login" className="font-semibold text-primary underline">Login here</Link>
                </CardDescription>
            </Card>
        </div>
    )
}
