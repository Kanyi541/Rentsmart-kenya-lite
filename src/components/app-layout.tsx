
'use client'

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Home, Building, Users, BedDouble } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/rentals', label: 'Rentals', icon: Building },
        { href: '/clients', label: 'Clients', icon: Users },
        { href: '/assignments', label: 'Assignments', icon: BedDouble },
    ]

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                            <Home className="h-6 w-6" />
                        </div>
                        <h1 className="text-xl font-bold">RentSmart</h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map(item => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
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
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
                     <SidebarTrigger className="md:hidden" />
                </header>
                <main className="p-4 sm:px-6 sm:py-0 space-y-4">
                    {children}
                </main>
            </SidebarInset>
        </>
    )
}
