
'use server';

import { rentalPriceSuggestion } from '@/ai/flows/rental-price-suggestion';
import { addRental as dbAddRental } from '@/lib/api/rentals';
import { addTenant as dbAddTenant } from '@/lib/api/tenants';
import { assignRoomToTenant as dbAssignRoom } from '@/lib/api/assignments';
import { createPayment, updatePaymentStatus } from '@/lib/api/payments';
import { rentalSchema, tenantSchema, assignmentSchema, initiatePaymentSchema } from '@/lib/schemas';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
        let errorMessage = 'Invalid rental data.';
        try {
            errorMessage = JSON.parse(parsedData.error.message)[0].message;
        } catch (e) {}
        return { error: errorMessage };
    }

    try {
        const result = await dbAddRental(parsedData.data);
         if (result.error) {
            return { error: result.error };
        }
        revalidatePath('/rentals');
        return { success: true };
    } catch (error: any) {
        console.error('Database error in addRental action:', error);
        return { error: 'Database error: Failed to add rental.'}
    }
}

export async function addTenant(data: unknown) {
    const parsedData = tenantSchema.safeParse(data);

    if(!parsedData.success) {
        let errorMessage = 'Invalid tenant data.';
        try {
            // Zod errors are an array of issues. We'll format them.
            errorMessage = parsedData.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
        } catch (e) {
             errorMessage = 'A validation error occurred.';
        }
        return { error: errorMessage };
    }

    try {
        const result = await dbAddTenant(parsedData.data);
        if (result.error) {
            return { error: result.error };
        }
        revalidatePath('/tenants');
        revalidatePath('/');
        return { success: true, id: result.id };
    } catch (error) {
        console.error('Database error in addTenant action:', error);
        return { error: 'Database error: Failed to add tenant.'}
    }
}

// This function simulates payment verification for testing purposes.
// In a real application, you would verify the payment transaction reference with Paystack's API here
// before creating payment records and assigning the room.
async function verifyPayment(transactionRef: string) {
    console.log(`SIMULATING payment verification for transaction ref: ${transactionRef}`);
    console.log("The live payment process will be activated upon system purchase.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    console.log(`Verification successful for ${transactionRef}`);
    return { success: true };
}


export async function processPaymentAndAssign(data: unknown) {
    const parsedData = initiatePaymentSchema.safeParse(data);

    if (!parsedData.success) {
        return { error: 'Invalid payment data.' };
    }
    
    const { tenantId, rentalId, roomId, rentAmount, depositAmount, phone, email, transactionRef } = parsedData.data;

    // This is a simulated verification for testing.
    const verification = await verifyPayment(transactionRef);
    if (!verification.success) {
        return { error: 'Payment verification failed. Please contact support.'}
    }

    // 1. Create payment records for rent and deposit
    const rentPaymentId = await createPayment({
        tenantId, rentalId, roomId, amount: rentAmount, type: 'Rent',
        status: 'Completed', transactionId: transactionRef, phone, email
    });

    const depositPaymentId = await createPayment({
        tenantId, rentalId, roomId, amount: depositAmount, type: 'Deposit',
        status: 'Completed', transactionId: transactionRef, phone, email
    });
    
    // Invalidate payments page cache
    revalidatePath('/payments');
    
    // 2. Assign the room
    try {
        await dbAssignRoom({ tenantId, rentalId, roomId });
    } catch (error) {
        console.error(error);
        // If room assignment fails, we should ideally refund the payment or flag for manual intervention.
        await updatePaymentStatus(rentPaymentId, 'Failed');
        await updatePaymentStatus(depositPaymentId, 'Failed');
        return { error: 'Payment was successful, but failed to assign the room. Please contact support.' };
    }
    
    // 3. Redirect to assignments page
    redirect('/assignments?status=success');
}
