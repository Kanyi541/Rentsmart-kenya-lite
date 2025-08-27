
import { ClientLoginForm } from '@/components/auth/client-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
                <CardContent className="pt-0">
                    <div className="space-y-2 text-center text-sm">
                        <p>
                            Don't have an account?{' '}
                            <Link href="/clients/register" className="font-semibold text-primary underline">
                                Register here
                            </Link>
                        </p>
                        <p>
                            <Link href="/admin/login" className="font-semibold text-primary underline">
                                Are you an admin? Login here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
