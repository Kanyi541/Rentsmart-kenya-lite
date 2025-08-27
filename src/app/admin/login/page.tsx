
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
             <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                </CardHeader>
                <AdminLoginForm />
                <CardContent className="pt-0">
                     <div className="text-center text-sm">
                        <Link href="/clients/login" className="font-semibold text-primary underline">
                            Are you a tenant? Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
