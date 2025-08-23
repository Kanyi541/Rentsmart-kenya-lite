'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { RentalForm } from '@/components/rental-form';
import { RentalListings } from '@/components/rental-listings';
import { useToast } from '@/hooks/use-toast';
import type { Rental } from '@/lib/types';

export default function Home() {
  const [newRental, setNewRental] = useState<Rental | null>(null);
  const { toast } = useToast();

  const handleAddRental = (data: Omit<Rental, 'id'>) => {
    const rental: Rental = {
      ...data,
      id: new Date().getTime().toString(),
    };
    setNewRental(rental);
    toast({
      title: 'Rental Added!',
      description: `${data.name} in ${data.location} has been successfully added.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <RentalForm onAddRental={handleAddRental} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <RentalListings newRental={newRental} />
          </div>
        </div>
      </main>
    </div>
  );
}