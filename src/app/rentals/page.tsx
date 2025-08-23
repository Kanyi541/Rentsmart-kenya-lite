'use client'

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { RentalForm } from '@/components/rental-form';
import { RentalListings } from '@/components/rental-listings';
import type { Rental } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function RentalsPage() {
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
    <AppLayout>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2 grid auto-rows-max items-start gap-4">
            <RentalForm onAddRental={handleAddRental} />
        </div>
        <div className="lg:col-span-3 grid auto-rows-max items-start gap-4">
            <RentalListings newRental={newRental} />
        </div>
      </div>
    </AppLayout>
  )
}
