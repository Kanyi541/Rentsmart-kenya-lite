
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

// This is a simulated payment initiation function.
async function initiateMpesaStkPush(phone: string, amount: number, transactionId: string) {
    console.log(`Simulating STK Push to ${phone} for KSh ${amount} with transaction ID: ${transactionId}`);
    // In a real application, this would be an API call to Safaricom's M-Pesa API.
    // We simulate a delay for the user to "enter their PIN".
    await new Promise(resolve => setTimeout(resolve, 5000));
    // We simulate a successful payment callback.
    console.log(`Simulating successful M-Pesa callback for transaction ID: ${transactionId}`);
    return { success: true };
}

export async function processPaymentAndAssign(data: unknown) {
    const parsedData = initiatePaymentSchema.safeParse(data);

    if (!parsedData.success) {
        return { error: 'Invalid payment data.' };
    }
    
    const { tenantId, rentalId, roomId, rentAmount, depositAmount, phone } = parsedData.data;

    // 1. Create payment records for rent and deposit
    const rentTransactionId = `RENT_${Date.now()}`;
    const depositTransactionId = `DEP_${Date.now()}`;

    const rentPaymentId = await createPayment({
        tenantId, rentalId, roomId, amount: rentAmount, type: 'Rent',
        status: 'Pending', transactionId: rentTransactionId, phone
    });

    const depositPaymentId = await createPayment({
        tenantId, rentalId, roomId, amount: depositAmount, type: 'Deposit',
        status: 'Pending', transactionId: depositTransactionId, phone
    });
    
    // Invalidate payments page cache
    revalidatePath('/payments');

    // 2. Simulate M-Pesa STK Push
    const totalAmount = rentAmount + depositAmount;
    const mpesaResult = await initiateMpesaStkPush(phone, totalAmount, `${rentTransactionId}_${depositTransactionId}`);

    if (!mpesaResult.success) {
        await Promise.all([
            updatePaymentStatus(rentPaymentId, 'Failed'),
            updatePaymentStatus(depositPaymentId, 'Failed')
        ]);
        return { error: 'M-Pesa payment failed or was cancelled.' };
    }

    // 3. Update payment statuses to 'Completed'
    await Promise.all([
        updatePaymentStatus(rentPaymentId, 'Completed'),
        updatePaymentStatus(depositPaymentId, 'Completed')
    ]);
    
    revalidatePath('/payments');
    
    // 4. Assign the room
    try {
        await dbAssignRoom({ tenantId, rentalId, roomId });
    } catch (error) {
        console.error(error);
        return { error: 'Payment was successful, but failed to assign the room. Please contact support.' };
    }
    
    // 5. Redirect to assignments page
    redirect('/assignments?status=success');
}
