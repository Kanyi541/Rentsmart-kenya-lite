
'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const adminPaths = ['/', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          if (adminPaths.includes(pathname)) {
            router.push('/admin/login');
          } else {
            router.push('/clients/login');
          }
        } else {
          // User is logged in, check role
          if (userRole === 'admin' && !adminPaths.includes(pathname)) {
            // Admin trying to access client page
             router.push('/');
          } else if (userRole === 'client' && adminPaths.includes(pathname)) {
            // Client trying to access admin page
            router.push('/clients');
          }
        }
      }
    }, [user, loading, router, pathname, userRole]);

    if (loading || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }

    // Role-based access control might still show the page for a flash before redirecting.
    // This check prevents that.
    if (userRole === 'admin' && !adminPaths.includes(pathname)) return null;
    if (userRole === 'client' && adminPaths.includes(pathname)) return null;


    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
