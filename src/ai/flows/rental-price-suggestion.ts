'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting rental prices based on property characteristics and location.
 *
 * - rentalPriceSuggestion - A function that takes property details as input and returns a suggested rental price.
 * - RentalPriceSuggestionInput - The input type for the rentalPriceSuggestion function.
 * - RentalPriceSuggestionOutput - The return type for the rentalPriceSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RentalPriceSuggestionInputSchema = z.object({
  location: z.string().describe('The location of the property.'),
  propertyType: z.string().describe('The type of property (e.g., apartment, house).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  squareFootage: z.number().describe('The square footage of the property.'),
  amenities: z.string().describe('A description of the amenities offered by the property.'),
  comparableRentals: z.string().optional().describe('Optional details of comparable rentals in the area.'),
});
export type RentalPriceSuggestionInput = z.infer<typeof RentalPriceSuggestionInputSchema>;

const RentalPriceSuggestionOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested monthly rental price for the property.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type RentalPriceSuggestionOutput = z.infer<typeof RentalPriceSuggestionOutputSchema>;

export async function rentalPriceSuggestion(input: RentalPriceSuggestionInput): Promise<RentalPriceSuggestionOutput> {
  return rentalPriceSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rentalPriceSuggestionPrompt',
  input: {schema: RentalPriceSuggestionInputSchema},
  output: {schema: RentalPriceSuggestionOutputSchema},
  prompt: `You are an expert real estate analyst specializing in rental pricing.

  Based on the following property details, suggest a competitive monthly rental price.

  Location: {{{location}}}
  Property Type: {{{propertyType}}}
  Bedrooms: {{{bedrooms}}}
  Bathrooms: {{{bathrooms}}}
  Square Footage: {{{squareFootage}}}
  Amenities: {{{amenities}}}
  {{~#if comparableRentals}}
  Comparable Rentals: {{{comparableRentals}}}
  {{~/if}}

  Provide a suggested monthly rental price and explain your reasoning.
  Be sure to output the price as a number, without any currency symbols.  The suggestedPrice must be a number. Do not use a currency symbol.
  Make sure to set the suggestedPrice and reasoning appropriately.`, 
});

const rentalPriceSuggestionFlow = ai.defineFlow(
  {
    name: 'rentalPriceSuggestionFlow',
    inputSchema: RentalPriceSuggestionInputSchema,
    outputSchema: RentalPriceSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
