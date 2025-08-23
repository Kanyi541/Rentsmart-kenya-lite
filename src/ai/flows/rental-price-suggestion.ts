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
  propertyType: z.string().describe('The name of the rental property or apartment building.'),
  roomType: z.string().describe('The type of room (e.g., Bedsitter, 2 Bedroom).'),
});
export type RentalPriceSuggestionInput = z.infer<typeof RentalPriceSuggestionInputSchema>;

const RentalPriceSuggestionOutputSchema = z.object({
  rent: z.number().describe('The suggested monthly rental price for the room.'),
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
  prompt: `You are an expert real estate analyst specializing in rental pricing in Kenya.

  Based on the following property details, suggest a competitive monthly rental price for a single room/unit.

  Location: {{{location}}}
  Rental Property Name: {{{propertyType}}}
  Room Type: {{{roomType}}}

  Provide a suggested monthly rental price (in KSh) and a brief explanation for your reasoning.
  Your reasoning should consider the location and room type to justify the price.
  Be sure to output the price as a number, without any currency symbols. The rent must be a number. Do not use a currency symbol.
  Make sure to set the rent and reasoning appropriately.`, 
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
