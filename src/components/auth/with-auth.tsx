

'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const adminPaths = ['/admin', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];
const clientPaths = ['/clients'];

// Define paths that don't require authentication
const publicPaths = ['/', '/demo', '/admin/login', '/clients/login', '/clients/register', '/clients/forgot-password'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) {
        return; // Wait until authentication status is determined
      }

      const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/terms') || pathname.startsWith('/privacy');

      if (!user) {
        // If user is not logged in and not on a public page, redirect to login.
        if (!isPublicPath) {
           // Heuristic to redirect to the most likely login page
           if (adminPaths.some(p => pathname.startsWith(p))) {
             router.replace('/admin/login');
           } else if (clientPaths.some(p => pathname.startsWith(p))) {
             router.replace('/clients/login');
           } else {
             // Default redirect for any other protected routes.
             router.replace('/clients/login');
           }
        }
        return;
      }
      
      // If user is logged in, handle role-based access and redirection from public pages
      const publicButNotRoot = (pathname.startsWith('/admin/login') || pathname.startsWith('/clients/login') || pathname.startsWith('/clients/register') || pathname.startsWith('/clients/forgot-password') || pathname.startsWith('/demo'));

      if (userRole === 'admin') {
        // If an admin lands on a client path or a public auth path (but not the root landing page), redirect to admin home.
        const isClientPath = clientPaths.some(p => pathname.startsWith(p));
        if (isClientPath || publicButNotRoot) {
          router.replace('/admin/dashboard');
        }
      } else if (userRole === 'client') {
        // If a client lands on an admin path or a public auth path (but not the root landing page), redirect to client home.
        const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
         if (isAdminPath || publicButNotRoot) {
          router.replace('/clients');
        }
      }

    }, [user, loading, router, pathname, userRole]);

    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/terms') || pathname.startsWith('/privacy');

    // Show loading spinner for protected pages while auth state is resolving
    if (loading && !isPublicPath) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }
    
    const publicButNotRoot = (pathname.startsWith('/admin/login') || pathname.startsWith('/clients/login') || pathname.startsWith('/clients/register') || pathname.startsWith('/clients/forgot-password') || pathname.startsWith('/demo'));
    // If a logged-in user is on a page like login/register, show a loader while redirecting
    if (user && publicButNotRoot) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }

    // If not loading and no user, and it's a protected route, show loading spinner until redirect happens.
    if (!user && !isPublicPath) {
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
