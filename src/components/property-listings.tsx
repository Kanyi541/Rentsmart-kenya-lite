'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from './property-card';
import type { Property } from '@/lib/types';

const initialProperties: Property[] = [
  {
    id: '1',
    propertyType: 'Modern Apartment',
    location: 'Westlands, Nairobi',
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1500,
    amenities: 'Swimming pool, Gym, 24/7 Security, Backup generator.',
    rent: 120000,
    imageUrl: 'https://placehold.co/600x400.png',
  },
  {
    id: '2',
    propertyType: 'Cozy Townhouse',
    location: 'Karen, Nairobi',
    bedrooms: 4,
    bathrooms: 4,
    squareFootage: 2500,
    amenities: 'Private garden, Gated community, Fireplace, Modern kitchen.',
    rent: 250000,
    imageUrl: 'https://placehold.co/600x400.png',
  },
  {
    id: '3',
    propertyType: 'Studio Apartment',
    location: 'Kileleshwa, Nairobi',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    amenities: 'High-speed internet, Balcony with a view, Fully furnished.',
    rent: 75000,
    imageUrl: 'https://placehold.co/600x400.png',
  },
];

export function PropertyListings({ newProperty }: { newProperty: Property | null }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);

  useEffect(() => {
    if (newProperty && !properties.find(p => p.id === newProperty.id)) {
      setProperties(prev => [newProperty, ...prev]);
    }
  }, [newProperty, properties]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Available Properties</h2>
        <p className="text-muted-foreground">Browse through the latest rental listings.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
