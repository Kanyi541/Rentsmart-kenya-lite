'use client';

import { useState, useEffect } from 'react';
import { RentalCard } from './rental-card';
import type { Rental } from '@/lib/types';

const initialRentals: Rental[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    location: 'Westlands, Nairobi',
    ownerName: 'Alice Mwangi',
    ownerNumber: '0711223344',
    rooms: [
      { id: '101', roomNumber: 'A101', roomType: '2 Bedroom', rent: 85000 },
      { id: '102', roomNumber: 'A102', roomType: '3 Bedroom', rent: 120000 },
      { id: '103', roomNumber: 'B201', roomType: '1 Bedroom', rent: 60000 },
    ]
  },
  {
    id: '2',
    name: 'Karen Luxury Homes',
    location: 'Karen, Nairobi',
    ownerName: 'Bob Chege',
    ownerNumber: '0722334455',
    rooms: [
        { id: '201', roomNumber: 'H1', roomType: '4 Bedroom', rent: 250000 },
        { id: '202', roomNumber: 'H2', roomType: '4 Bedroom', rent: 260000 },
    ]
  },
  {
    id: '3',
    name: 'Kileleshwa Studios',
    location: 'Kileleshwa, Nairobi',
    ownerName: 'Charles Odira',
    ownerNumber: '0733445566',
    rooms: [
        { id: '301', roomNumber: 'S1', roomType: 'Bedsitter', rent: 45000 },
        { id: '302', roomNumber: 'S2', roomType: 'Bedsitter', rent: 45000 },
        { id: '303', roomNumber: 'S3', roomType: 'Single Room', rent: 25000 },
    ]
  },
];

export function RentalListings({ newRental }: { newRental: Rental | null }) {
  const [rentals, setRentals] = useState<Rental[]>(initialRentals);

  useEffect(() => {
    if (newRental && !rentals.find(p => p.id === newRental.id)) {
      setRentals(prev => [newRental, ...prev]);
    }
  }, [newRental, rentals]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rental Properties</h2>
        <p className="text-muted-foreground">Browse through the available rental properties.</p>
      </div>
      <div className="space-y-6">
        {rentals.map((rental) => (
          <RentalCard key={rental.id} rental={rental} />
        ))}
      </div>
    </div>
  );
}
