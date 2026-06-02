import { AdminRegisterForm } from '@/components/auth/admin-register-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Suspense } from 'react';

export default function AdminRegisterPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Property Manager Sign Up</CardTitle>
                    <CardDescription>Create your organization and start your management journey.</CardDescription>
                </CardHeader>
                <Suspense fallback={<div>Loading...</div>}>
                    <AdminRegisterForm />
                </Suspense>
                <CardContent className="pt-0">
                     <div className="text-center text-sm">
                        <Link href="/admin/login" className="font-semibold text-primary underline">
                            Already have an account? Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
