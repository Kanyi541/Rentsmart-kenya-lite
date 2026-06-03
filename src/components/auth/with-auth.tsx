
'use client'

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { LoadingAnimation } from '../loading';

const superAdminPaths = ['/super-admin'];
const adminPaths = ['/admin', '/rentals', '/tenants', '/assignments', '/payments', '/reports'];
const clientPaths = ['/clients'];

const publicPaths = ['/', '/demo', '/admin/login', '/admin/register', '/clients/login', '/clients/register', '/clients/forgot-password'];

export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading, userRole, organization } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) {
        return;
      }

      const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/terms') || pathname.startsWith('/privacy');

      if (!user) {
        if (!isPublicPath) {
           if (adminPaths.some(p => pathname.startsWith(p))) {
             router.replace('/admin/login');
           } else if (clientPaths.some(p => pathname.startsWith(p))) {
             router.replace('/clients/login');
           } else if (superAdminPaths.some(p => pathname.startsWith(p))) {
             router.replace('/admin/login');
           } else {
             router.replace('/');
           }
        }
        return;
      }
      
      const publicButNotRoot = (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/register') || pathname.startsWith('/clients/login') || pathname.startsWith('/clients/register') || pathname.startsWith('/clients/forgot-password') || pathname.startsWith('/demo'));

      if (userRole === 'super-admin') {
        if (!pathname.startsWith('/super-admin') && !isPublicPath) {
          router.replace('/super-admin/dashboard');
        }
      } else if (userRole === 'admin') {
        if (organization?.subscriptionStatus === 'pending_payment' && pathname !== '/admin/subscription/checkout') {
          router.replace('/admin/subscription/checkout');
          return;
        }

        const isClientPath = clientPaths.some(p => pathname.startsWith(p));
        const isSuperPath = superAdminPaths.some(p => pathname.startsWith(p));
        if (isClientPath || isSuperPath || publicButNotRoot) {
          router.replace('/admin/dashboard');
        }
      } else if (userRole === 'client') {
        const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
        const isSuperPath = superAdminPaths.some(p => pathname.startsWith(p));
         if (isAdminPath || isSuperPath || publicButNotRoot) {
          router.replace('/clients');
        }
      }

    }, [user, loading, router, pathname, userRole, organization]);

    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/terms') || pathname.startsWith('/privacy');

    if (loading && !isPublicPath) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingAnimation />
        </div>
      );
    }
    
    const publicButNotRoot = (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/register') || pathname.startsWith('/clients/login') || pathname.startsWith('/clients/register') || pathname.startsWith('/clients/forgot-password') || pathname.startsWith('/demo'));
    if (user && publicButNotRoot) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <LoadingAnimation />
        </div>
      );
    }

    if (!user && !isPublicPath) {
         return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingAnimation />
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
