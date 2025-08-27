
import { ClientLoginForm } from '@/components/auth/client-login-form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function ClientLoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Tenant Login</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <ClientLoginForm />
                <CardDescription className="p-6 pt-0 text-center text-sm">
                    Don't have an account? <Link href="/clients/register" className="font-semibold text-primary underline">Register here</Link>
                </CardDescription>
            </Card>
        </div>
    )
}
