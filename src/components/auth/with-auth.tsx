
'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const adminPaths = ['/', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];
const clientPaths = ['/clients'];

// Define paths that don't require authentication
const publicPaths = ['/admin/login', '/clients/login', '/clients/register', '/clients/forgot-password'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) {
        return; // Wait until authentication status is determined
      }

      const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/clients/forgot-password');

      if (!user) {
        // If user is not logged in and not on a public page, redirect to login.
        if (!isPublicPath) {
           // Heuristic to redirect to the most likely login page
           if (adminPaths.some(p => pathname.startsWith(p) && p !== '/')) {
             router.replace('/admin/login');
           } else if (clientPaths.some(p => pathname.startsWith(p))) {
             router.replace('/clients/login');
           } else if (pathname === '/') {
             // If they land on the root, they're likely an admin
             router.replace('/admin/login');
           }
        }
        return;
      }
      
      // If user is logged in, handle role-based access and redirection from public pages
      if (userRole === 'admin') {
        // If an admin lands on a client or public path, redirect to admin home.
        if (clientPaths.some(p => pathname.startsWith(p)) || isPublicPath) {
          router.replace('/');
        }
      } else if (userRole === 'client') {
        // If a client lands on an admin or public path, redirect to client home.
        // Check if current path is an admin path (and not just the root '/')
        const isAdminPath = adminPaths.includes(pathname);
        if (isAdminPath || isPublicPath) {
          router.replace('/clients');
        }
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
    if (!user && !publicPaths.includes(pathname)) {
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
