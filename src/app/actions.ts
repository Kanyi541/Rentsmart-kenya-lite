'use server';

import { rentalPriceSuggestion } from '@/ai/flows/rental-price-suggestion';
import { z } from 'zod';

const suggestionInputSchema = z.object({
  location: z.string(),
  propertyType: z.string(),
  bedrooms: z.coerce.number(),
  bathrooms: z.coerce.number(),
  squareFootage: z.coerce.number(),
  amenities: z.string(),
});

export async function getRentalSuggestion(data: unknown) {
  const parsedData = suggestionInputSchema.safeParse(data);

  if (!parsedData.success) {
    let errorMessage = 'Invalid input data.';
    try {
        errorMessage = JSON.parse(parsedData.error.message)[0].message;
    } catch (e) {}
    return { error: errorMessage };
  }

  try {
    const result = await rentalPriceSuggestion(parsedData.data);
    return { suggestion: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get rental suggestion. Please try again later.' };
  }
}
