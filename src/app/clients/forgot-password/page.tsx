
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                </CardHeader>
                <ForgotPasswordForm />
            </Card>
        </div>
    )
}
