import Image from 'next/image';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Property } from '@/lib/types';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={property.imageUrl}
            alt={property.propertyType}
            fill
            className="object-cover"
            data-ai-hint="apartment building"
          />
        </div>
        <div className="p-4">
          <CardTitle className="text-xl font-bold">{property.propertyType}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-muted-foreground pt-1">
            <MapPin className="h-4 w-4" />
            {property.location}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{property.bedrooms}</span> beds
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bath className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{property.bathrooms}</span> baths
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{property.squareFootage}</span> sqft
          </div>
        </div>
        <p className="mt-4 text-sm text-foreground line-clamp-2">{property.amenities}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/30">
        <div>
          <span className="text-2xl font-bold text-primary">KSh {property.rent.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        <Button>Contact Landlord</Button>
      </CardFooter>
    </Card>
  );
}
