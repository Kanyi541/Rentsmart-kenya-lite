'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Check, Menu } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import Rent1 from '../../public/Rent1.jpg';
import Rent2 from '../../public/Rent2.jpg';
import Rent3 from '../../public/Rent3.jpg';
import RentSmartLogo from '../../public/RentSmart.png';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const localHeroImages = [
  { src: Rent1, hint: 'apartment building' },
  { src: Rent2, hint: 'modern kitchen' },
  { src: Rent3, hint: 'happy tenant' }
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % localHeroImages.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
          <NextImage src={RentSmartLogo} alt="RentSmart Logo" width={32} height={32} className="object-contain" priority />
          <span className="font-bold text-lg text-primary">RentSmart</span>
        </Link>
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-auto lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Access your account or learn more about RentSmart.</SheetDescription>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium mt-6">
                    <Link href="#" className="flex items-center gap-2 text-lg font-semibold" prefetch={false}>
                        <NextImage src={RentSmartLogo} alt="RentSmart Logo" width={32} height={32} className="object-contain" />
                        <span>RentSmart</span>
                    </Link>
                    <Link href="/admin/login" className="text-muted-foreground hover:text-primary">Admin Login</Link>
                    <Link href="/clients/login" className="text-muted-foreground hover:text-primary">Tenant Login</Link>
                </nav>
            </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1 flex flex-col">
        <section className="relative w-full flex-1 flex items-center justify-center text-center text-white min-h-[600px]">
            {localHeroImages.map((image, index) => (
                <NextImage
                    key={index}
                    src={image.src}
                    alt="Background"
                    fill
                    priority
                    sizes="100vw"
                    className={cn(
                        'object-cover transition-opacity duration-1000 ease-in-out',
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    )}
                    placeholder="blur"
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
                         <Button asChild size="lg" variant="secondary" className="px-12 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform">
                            <Link href="/demo" prefetch={false}>
                                Explore Demo
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Straightforward Pricing for Your Success</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Select a plan that scales with your property management needs. No hidden fees.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 pt-12 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 2,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>The essential toolkit for managing your first few properties with ease.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      1 Property Limit
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Core Property Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Tenant Database
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/admin/register?plan=Starter">Choose Plan</Link>
                    </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary shadow-lg scale-105 relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                 <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Growth</CardTitle>
                   <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 4,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Advanced features for professionals scaling their rental portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      5 Properties Limit
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Announcements & Complaints
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Move-out Management
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full shadow-md">
                        <Link href="/admin/register?plan=Growth">Choose Plan</Link>
                    </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Scale</CardTitle>
                   <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Ksh 9,999</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>The ultimate solution for large-scale property operations and agencies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      Unlimited Properties
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Priority Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Full Feature Access
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/admin/register?plan=Scale">Choose Plan</Link>
                    </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/30">
        <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">&copy; 2024 RentSmart Kenya Lite. All rights reserved.</p>
            <span className="text-[10px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground font-mono">v1.1.0-stable</span>
        </div>
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
