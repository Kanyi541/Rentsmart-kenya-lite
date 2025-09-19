
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Home, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { heroImages } from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

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
                </nav>
            </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1 flex flex-col">
        <section className="relative w-full flex-1 flex items-center justify-center text-center text-white">
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
                    <div className="flex flex-col items-center gap-4">
                        <Button asChild size="lg">
                             <Link href="/clients/register" prefetch={false}>
                                Get Started As a Tenant
                            </Link>
                        </Button>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                            <Button asChild size="lg" variant="secondary">
                                <Link href="/clients/login" prefetch={false}>
                                Tenant Login
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="secondary">
                                <Link href="/admin/login" prefetch={false}>
                                Admin Login
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for you
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 pt-12 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Basic</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 2,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Perfect for small property managers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Property Management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Tenant Management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Basic Reporting
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Get Started</Button>
                </CardFooter>
              </Card>

              <Card className="border-primary shadow-lg">
                 <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Professional</CardTitle>
                   <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 4,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>For growing property management businesses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      Everything in Basic
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Advanced Reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Email Notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Document Storage
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Get Started</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                   <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 9,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Complete solution for large property managers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      Everything in Professional
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      API Access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Priority Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Custom Branding
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Get Started</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 RentSmart Kenya Lite. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
