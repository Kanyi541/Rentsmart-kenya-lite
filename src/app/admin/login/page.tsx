
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
             <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                </CardHeader>
                <AdminLoginForm />
            </Card>
        </div>
    )
}
