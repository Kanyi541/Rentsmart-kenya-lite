'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { PropertyForm } from '@/components/property-form';
import { PropertyListings } from '@/components/property-listings';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@/lib/types';
import type { z } from 'zod';
import { type propertySchema } from '@/lib/schemas';

type PropertyFormData = z.infer<typeof propertySchema>;

export default function Home() {
  const [newProperty, setNewProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const handleAddProperty = (data: PropertyFormData) => {
    const property: Property = {
      ...data,
      id: new Date().getTime().toString(),
      imageUrl: 'https://placehold.co/600x400.png',
    };
    setNewProperty(property);
    toast({
      title: 'Property Listed!',
      description: `${data.propertyType} in ${data.location} has been successfully listed.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <PropertyForm onAddProperty={handleAddProperty} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <PropertyListings newProperty={newProperty} />
          </div>
        </div>
      </main>
    </div>
  );
}
