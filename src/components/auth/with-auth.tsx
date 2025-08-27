
'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const adminPaths = ['/', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];
const clientPaths = ['/clients'];

// Define paths that don't require authentication
const publicPaths = ['/admin/login', '/clients/login', '/clients/register'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) {
        return; // Wait until authentication status is determined
      }

      const isPublicPath = publicPaths.includes(pathname);

      if (!user) {
        // If user is not logged in and not on a public page, redirect to login.
        if (!isPublicPath) {
           // Heuristic to redirect to the most likely login page
           if (adminPaths.some(p => pathname.startsWith(p))) {
             router.replace('/admin/login');
           } else {
             router.replace('/clients/login');
           }
        }
        return;
      }
      
      // If user is logged in, handle role-based access
      if (userRole === 'admin' && clientPaths.some(p => pathname.startsWith(p))) {
         router.replace('/');
      } else if (userRole === 'client' && adminPaths.some(p => pathname.startsWith(p))) {
         router.replace('/clients');
      }

    }, [user, loading, router, pathname, userRole]);

    // Show loading spinner for protected pages while auth state is resolving
    if (loading && !publicPaths.includes(pathname)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }
    
    // For public pages, render them immediately to avoid a flash of the loading spinner.
    // Also, if a logged-in user tries to access a login page, the useEffect will redirect them.
    if (publicPaths.includes(pathname)) {
        return <WrappedComponent {...props} />;
    }

    // If not loading and no user, and it's a protected route, show loading spinner until redirect happens.
    if (!user) {
         return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    // If everything is fine, render the component.
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
