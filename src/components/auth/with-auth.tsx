
'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const adminPaths = ['/', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];
const clientPaths = ['/clients'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          // If not logged in, redirect to the appropriate login page
          if (adminPaths.some(p => pathname.startsWith(p)) && pathname !== '/admin/login') {
            router.push('/admin/login');
          } else if (clientPaths.some(p => pathname.startsWith(p)) && pathname !== '/clients/login' && pathname !== '/clients/register') {
            router.push('/clients/login');
          }
        } else {
          // User is logged in, check role and redirect if necessary
          if (userRole === 'admin' && clientPaths.some(p => pathname.startsWith(p))) {
            // Admin trying to access client page
             router.push('/');
          } else if (userRole === 'client' && adminPaths.some(p => pathname.startsWith(p))) {
            // Client trying to access admin page
            router.push('/clients');
          }
        }
      }
    }, [user, loading, router, pathname, userRole]);

    if (loading || !user) {
      // Allow access to login/register pages while loading/not authenticated
      if (pathname === '/admin/login' || pathname === '/clients/login' || pathname === '/clients/register') {
        return <WrappedComponent {...props} />;
      }
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }

    // Final check to prevent content flash
    if (userRole === 'admin' && clientPaths.some(p => pathname.startsWith(p))) return null;
    if (userRole === 'client' && adminPaths.some(p => pathname.startsWith(p))) return null;


    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
