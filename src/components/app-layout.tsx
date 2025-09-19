

'use client'

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarProvider } from "./ui/sidebar";
import { Home, Building, Users, BedDouble, CreditCard, LogOut, FileText, User, Wrench, Megaphone, ShieldAlert, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { userRole, logout } = useAuth();

    const adminMenuItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { href: '/rentals', label: 'Rentals', icon: Building },
        { href: '/tenants', label: 'Tenants', icon: Users },
        { href: '/assignments', label: 'Assignments', icon: BedDouble },
        { href: '/payments', label: 'Payments', icon: CreditCard },
        { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        { href: '/admin/complaints', label: 'Complaints', icon: ShieldAlert },
        { href: '/admin/move-out', label: 'Move-out Notices', icon: LogOut },
    ];

    const clientMenuItems = [
        { href: '/clients', label: 'My Dashboard', icon: User },
        { href: '/clients/maintenance', label: 'Maintenance', icon: Wrench },
        { href: '/clients/complaints', label: 'Complaints', icon: ShieldAlert },
        { href: '/clients/checklist', label: 'Checklist', icon: ClipboardList },
        { href: '/clients/move-out', label: 'Move Out', icon: LogOut },
    ];

    const menuItems = userRole === 'admin' ? adminMenuItems : clientMenuItems;
    const homeRoute = userRole === 'admin' ? '/admin/dashboard' : '/clients';


    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                     <Link href={homeRoute} className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                            <Home className="h-6 w-6" />
                        </div>
                        <h1 className="text-xl font-bold">RentSmart</h1>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map(item => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(item.href)}
                                    >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                 <div className="p-2 mt-auto">
                    <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
                     <SidebarTrigger className="md:hidden" />
                </header>
                <main className="p-4 sm:px-6 sm:py-0 space-y-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
