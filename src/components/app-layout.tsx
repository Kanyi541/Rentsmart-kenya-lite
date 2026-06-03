'use client'

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarProvider } from "./ui/sidebar";
import { Home, Building, Users, BedDouble, CreditCard, LogOut, User, Megaphone, ShieldAlert, ClipboardList, Lock, Crown, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { useLoading } from "@/hooks/use-loading";
import { useEffect } from "react";
import { Badge } from "./ui/badge";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { userRole, logout, organization } = useAuth();
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        stopLoading();
    }, [pathname, stopLoading]);

    const plan = organization?.plan || 'Starter';

    const superAdminMenuItems = [
        { href: '/super-admin/dashboard', label: 'System Overview', icon: Crown },
    ];

    const adminMenuItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, minPlan: 'Starter' },
        { href: '/rentals', label: 'Rentals', icon: Building, minPlan: 'Starter' },
        { href: '/tenants', label: 'Tenants', icon: Users, minPlan: 'Starter' },
        { href: '/assignments', label: 'Assignments', icon: BedDouble, minPlan: 'Starter' },
        { href: '/payments', label: 'Payments', icon: CreditCard, minPlan: 'Starter' },
        { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, minPlan: 'Growth' },
        { href: '/admin/complaints', label: 'Complaints', icon: ShieldAlert, minPlan: 'Growth' },
        { href: '/admin/move-out', label: 'Move-out Notices', icon: LogOut, minPlan: 'Growth' },
        { href: '/admin/settings/payments', label: 'Payment Settings', icon: Settings, minPlan: 'Starter' },
    ];

    const clientMenuItems = [
        { href: '/clients', label: 'My Dashboard', icon: User },
        { href: '/clients/maintenance', label: 'Maintenance', icon: ClipboardList },
        { href: '/clients/complaints', label: 'Complaints', icon: ShieldAlert },
        { href: '/clients/checklist', label: 'Checklist', icon: ClipboardList },
        { href: '/clients/move-out', label: 'Move Out', icon: LogOut },
    ];

    // Select top 4 items for mobile bottom navigation
    const getMobileNavItems = () => {
        if (userRole === 'super-admin') return superAdminMenuItems;
        if (userRole === 'admin') {
            return [
                { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
                { href: '/rentals', label: 'Rentals', icon: Building },
                { href: '/tenants', label: 'Tenants', icon: Users },
                { href: '/payments', label: 'Payments', icon: CreditCard },
            ];
        }
        return [
            { href: '/clients', label: 'Home', icon: Home },
            { href: '/clients/maintenance', label: 'Repairs', icon: ClipboardList },
            { href: '/clients/complaints', label: 'Complaints', icon: ShieldAlert },
            { href: '/clients/move-out', label: 'Move Out', icon: LogOut },
        ];
    };

    const isPlanSufficient = (minPlan: string) => {
        if (plan === 'Scale') return true;
        if (plan === 'Growth' && minPlan !== 'Scale') return true;
        if (plan === 'Starter' && minPlan === 'Starter') return true;
        return false;
    };

    const getMenuItems = () => {
        if (userRole === 'super-admin') return superAdminMenuItems;
        if (userRole === 'admin') return adminMenuItems;
        return clientMenuItems;
    };

    const menuItems = getMenuItems();
    const mobileNavItems = getMobileNavItems();
    const homeRoute = userRole === 'super-admin' ? '/super-admin/dashboard' : (userRole === 'admin' ? '/admin/dashboard' : '/clients');

    const handleNavigation = (e: React.MouseEvent, href: string, disabled?: boolean) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (pathname !== href) {
            startLoading();
        }
    };

    return (
        <SidebarProvider>
            <Sidebar className="hidden md:flex">
                <SidebarHeader>
                     <Link href={homeRoute} className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                            <Home className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold leading-none">RentSmart</h1>
                            {userRole === 'admin' && (
                                <Badge variant="outline" className="mt-1 w-fit text-[10px] h-4 bg-muted/50">
                                    {plan} Plan
                                </Badge>
                            )}
                            {userRole === 'super-admin' && (
                                <Badge variant="default" className="mt-1 w-fit text-[10px] h-4 bg-yellow-500 text-black border-none font-bold">
                                    SYSTEM OWNER
                                </Badge>
                            )}
                        </div>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map(item => {
                            const disabled = 'minPlan' in item && !isPlanSufficient(item.minPlan);
                            return (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.href)}
                                        className={disabled ? "opacity-50 grayscale cursor-not-allowed" : ""}
                                        tooltip={disabled ? `Requires ${item.minPlan} Plan` : undefined}
                                        >
                                        <Link 
                                            href={disabled ? "#" : item.href} 
                                            onClick={(e) => handleNavigation(e, item.href, disabled)}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </div>
                                            {disabled && <Lock className="h-3 w-3" />}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarContent>
                 <div className="p-4 mt-auto border-t space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Version</span>
                        <span>v1.1.0-stable</span>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive p-0 h-8" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
                     <SidebarTrigger className="md:hidden" />
                     <div className="md:hidden flex-1 flex justify-center">
                         <span className="font-bold text-primary tracking-tight">RentSmart Kenya</span>
                     </div>
                </header>
                <main className="p-4 sm:px-6 sm:py-0 pb-24 md:pb-4 space-y-4">
                    {children}
                </main>

                {/* Bottom Navigation for Mobile */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border flex items-center justify-around h-20 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    {mobileNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link 
                                key={item.label}
                                href={item.href}
                                onClick={(e) => handleNavigation(e, item.href)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all",
                                    isActive ? "bg-primary/10" : "bg-transparent"
                                )}>
                                    <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
