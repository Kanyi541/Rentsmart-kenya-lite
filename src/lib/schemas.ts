import { z } from 'zod';

export const propertySchema = z.object({
  propertyType: z.string().min(1, 'Property type is required.'),
  location: z.string().min(3, 'Location is required.'),
  bedrooms: z.coerce.number().min(0, 'Number of bedrooms must be a positive number.'),
  bathrooms: z.coerce.number().min(0, 'Number of bathrooms must be a positive number.'),
  squareFootage: z.coerce.number().min(1, 'Square footage is required.'),
  amenities: z.string().min(1, 'Please list at least one amenity.'),
  rent: z.coerce.number().min(1, 'Rent must be a positive number.'),
});
