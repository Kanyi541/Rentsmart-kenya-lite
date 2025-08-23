
'use server';

import { rentalPriceSuggestion } from '@/ai/flows/rental-price-suggestion';
import { addRental as dbAddRental } from '@/lib/api/rentals';
import { addTenant as dbAddTenant } from '@/lib/api/tenants';
import { assignRoomToTenant as dbAssignRoom } from '@/lib/api/assignments';
import { rentalSchema, tenantSchema, assignmentSchema } from '@/lib/schemas';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const suggestionInputSchema = z.object({
  location: z.string(),
  propertyType: z.string(),
  roomType: z.string(),
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

export async function addRental(data: unknown) {
    const parsedData = rentalSchema.safeParse(data);

    if(!parsedData.success) {
        return { error: 'Invalid rental data.' };
    }

    try {
        await dbAddRental(parsedData.data);
        revalidatePath('/rentals');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Database error: Failed to add rental.'}
    }
}

export async function addTenant(data: unknown) {
    const parsedData = tenantSchema.safeParse(data);

    if(!parsedData.success) {
        return { error: 'Invalid tenant data.' };
    }

    try {
        await dbAddTenant(parsedData.data);
        revalidatePath('/tenants');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Database error: Failed to add tenant.'}
    }
}

export async function assignRoomToTenant(data: unknown) {
    const parsedData = assignmentSchema.safeParse(data);

    if(!parsedData.success) {
        return { error: 'Invalid assignment data.' };
    }

    try {
        await dbAssignRoom(parsedData.data);
        revalidatePath('/assignments');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Database error: Failed to assign room.'}
    }
}
