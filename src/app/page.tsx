
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CheckCircle, Home, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { heroImages } from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 120000); // 2 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Home className="h-6 w-6 text-primary" />
          <span className="sr-only">RentSmart Kenya Lite</span>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="/clients/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Tenant Login
          </Link>
          <Link href="/admin/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Admin Login
          </Link>
        </nav>
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-auto lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="#" className="flex items-center gap-2 text-lg font-semibold" prefetch={false}>
                        <Home className="h-6 w-6 text-primary" />
                        <span>RentSmart</span>
                    </Link>
                    <Link href="#features" className="hover:text-primary" prefetch={false}>Features</Link>
                    <Link href="/clients/login" className="hover:text-primary" prefetch={false}>Tenant Login</Link>
                    <Link href="/admin/login" className="hover:text-primary" prefetch={false}>Admin Login</Link>
                </nav>
            </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] flex items-center justify-center text-center text-white">
            {heroImages.map((image, index) => (
                <Image
                    key={image.seed}
                    src={`https://picsum.photos/seed/${image.seed}/1920/1080`}
                    alt="Background"
                    fill
                    priority={index === 0}
                    className={cn(
                        'object-cover transition-opacity duration-1000 ease-in-out',
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    )}
                    data-ai-hint={image.hint}
                />
            ))}
             <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 container px-4 md:px-6">
                <div className="flex flex-col justify-center space-y-4 max-w-3xl mx-auto">
                    <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                        Modern Rental Management, Simplified.
                    </h1>
                    <p className="max-w-[600px] text-lg text-neutral-200 md:text-xl mx-auto [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                        RentSmart Kenya Lite is an all-in-one platform to streamline property management for landlords and provide a seamless experience for tenants.
                    </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                    <Button asChild size="lg">
                        <Link href="/clients/register" prefetch={false}>
                        Get Started as a Tenant
                        </Link>
                    </Button>
                    </div>
                </div>
            </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Manage Your Rentals</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From tenant onboarding to maintenance requests, our platform handles it all, saving you time and effort.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Tenant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Easily register and manage tenant information, track assignments, and handle move-in/move-out processes digitally.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> AI-Powered Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Leverage AI to get competitive rental price suggestions for your properties based on location and type.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Centralized Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Post announcements, manage complaints, and handle maintenance requests through a centralized system.</CardDescription>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Online Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Simulated payment processing for rent and deposits to streamline the tenant onboarding process.</CardDescription>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Occupancy Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Get a real-time overview of your property occupancy, with detailed views for each rental unit.</CardDescription>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary" /> Tenant Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>A dedicated dashboard for tenants to view their details, make requests, and see announcements.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 RentSmart Kenya Lite. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
