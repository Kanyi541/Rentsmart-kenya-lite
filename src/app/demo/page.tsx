
'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
    const { login } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loadingRole, setLoadingRole] = useState<'admin' | 'tenant' | null>(null);

    const handleLogin = async (role: 'admin' | 'tenant') => {
        setLoadingRole(role);
        const email = role === 'admin' ? 'rentsmart@demo.com' : 'tenant@demo.com';
        const password = role === 'admin' ? 'admin123!' : 'tenant123!';

        try {
            await login(email, password);
            toast({
                title: 'Demo Login Successful',
                description: `Welcome! You are now logged in as a demo ${role}.`,
            });
            // The withAuth HOC will handle the redirect to the correct dashboard.
            // We can push to a generic protected route and let it sort it out.
            router.push('/');
        } catch (error: any) {
            let description = 'An unknown error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                description = `The demo ${role} user does not exist. Please create it in the Firebase console.`;
            }
            toast({
                variant: 'destructive',
                title: 'Demo Login Failed',
                description: description,
            });
        } finally {
            setLoadingRole(null);
        }
    };
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">RentSmart Demo</h1>
                    <p className="text-muted-foreground">Log in with our pre-configured demo accounts to explore the platform.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Demo</CardTitle>
                            <CardDescription>Explore the property management dashboard with full administrative access.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="admin-email">Email</Label>
                                <Input id="admin-email" value="rentsmart@demo.com" readOnly />
                            </div>
                            <div>
                                <Label htmlFor="admin-password">Password</Label>
                                <Input id="admin-password" value="admin123!" readOnly type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleLogin('admin')} disabled={!!loadingRole}>
                                {loadingRole === 'admin' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login as Admin
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Demo</CardTitle>
                            <CardDescription>Experience the tenant portal from the perspective of a registered renter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="tenant-email">Email</Label>
                                <Input id="tenant-email" value="tenant@demo.com" readOnly />
                            </div>
                            <div>
                                <Label htmlFor="tenant-password">Password</Label>
                                <Input id="tenant-password" value="tenant123!" readOnly type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleLogin('tenant')} disabled={!!loadingRole}>
                                {loadingRole === 'tenant' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login as Tenant
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                 <div className="text-center">
                    <Button asChild variant="link">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Landing Page
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
