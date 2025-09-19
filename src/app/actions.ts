
'use server';

import { rentalPriceSuggestion } from '@/ai/flows/rental-price-suggestion';
import { addRental as dbAddRental } from '@/lib/api/rentals';
import { assignRoomToTenant as dbAssignRoom } from '@/lib/api/assignments';
import { createPayment, updatePaymentStatus } from '@/lib/api/payments';
import { createMaintenanceRequest as dbCreateMaintenanceRequest } from '@/lib/api/maintenance';
import { createAnnouncement as dbCreateAnnouncement, deleteAnnouncement as dbDeleteAnnouncement } from '@/lib/api/announcements';
import { createComplaint as dbCreateComplaint } from '@/lib/api/complaints';
import { createMoveOutNotice as dbCreateMoveOutNotice } from '@/lib/api/move-out';
import { rentalSchema, assignmentSchema, initiatePaymentSchema, createMaintenanceRequestSchema, announcementSchema, createComplaintSchema, createMoveOutNoticeSchema } from '@/lib/schemas';
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

    let rentPaymentId;
    let depositPaymentId;
    try {
        // 1. Create payment records for rent and deposit
        rentPaymentId = await createPayment({
            tenantId, rentalId, roomId, amount: rentAmount, type: 'Rent',
            status: 'Completed', transactionId: transactionRef, phone, email
        });

        depositPaymentId = await createPayment({
            tenantId, rentalId, roomId, amount: depositAmount, type: 'Deposit',
            status: 'Completed', transactionId: transactionRef, phone, email
        });
        
        // Invalidate payments page cache
        revalidatePath('/payments');
    } catch (error) {
        console.error('Failed to create payment records:', error);
        return { error: 'Failed to record payments in the database. Please contact support.' };
    }
    
    // 2. Assign the room
    try {
        await dbAssignRoom({ tenantId, rentalId, roomId });
    } catch (error) {
        console.error(error);
        // If room assignment fails, we should ideally refund the payment or flag for manual intervention.
        // For now, we'll mark the payments as failed.
        if (rentPaymentId) await updatePaymentStatus(rentPaymentId, 'Failed');
        if (depositPaymentId) await updatePaymentStatus(depositPaymentId, 'Failed');
        return { error: 'Payment was successful, but failed to assign the room. Please contact support.' };
    }
    
    // 3. Redirect to assignments page with a success flag
    redirect('/assignments?status=success');
}


export async function createMaintenanceRequest(data: unknown) {
    const parsedData = createMaintenanceRequestSchema.safeParse(data);

    if (!parsedData.success) {
        let errorMessage = 'Invalid maintenance request data.';
        try {
            errorMessage = JSON.parse(parsedData.error.message)[0].message;
        } catch (e) {}
        return { error: errorMessage };
    }

    // Note: Photo upload is simulated. In a real app, you'd upload to Firebase Storage
    // and get a URL here. We'll just pass a placeholder string.
    // const photoUrl = await uploadPhotoAndGetUrl(parsedData.data.photo);

    try {
        await dbCreateMaintenanceRequest({
            ...parsedData.data,
            // photoUrl: photoUrl
        });
        revalidatePath('/clients/maintenance');
        return { success: true };
    } catch (error: any) {
        console.error('Database error in createMaintenanceRequest action:', error);
        return { error: 'Database error: Failed to submit maintenance request.' };
    }
}

export async function createAnnouncement(data: unknown) {
    const parsedData = announcementSchema.safeParse(data);
    if (!parsedData.success) {
        return { error: 'Invalid announcement data.' };
    }
    try {
        await dbCreateAnnouncement(parsedData.data);
        revalidatePath('/admin/announcements');
        revalidatePath('/clients');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create announcement.' };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await dbDeleteAnnouncement(id);
        revalidatePath('/admin/announcements');
        revalidatePath('/clients');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete announcement.' };
    }
}

export async function createComplaint(data: unknown) {
    const parsedData = createComplaintSchema.safeParse(data);

    if (!parsedData.success) {
        let errorMessage = 'Invalid complaint data.';
        try {
            errorMessage = JSON.parse(parsedData.error.message)[0].message;
        } catch (e) {}
        return { error: errorMessage };
    }

    try {
        await dbCreateComplaint(parsedData.data);
        revalidatePath('/clients/complaints');
        revalidatePath('/admin/complaints');
        return { success: true };
    } catch (error: any) {
        console.error('Database error in createComplaint action:', error);
        return { error: 'Database error: Failed to submit complaint.' };
    }
}

export async function createMoveOutNotice(data: unknown) {
    const parsedData = createMoveOutNoticeSchema.safeParse(data);
    if (!parsedData.success) {
        return { error: 'Invalid data.' };
    }

    try {
        await dbCreateMoveOutNotice(parsedData.data);
        revalidatePath('/clients/move-out');
        revalidatePath('/admin/move-out');
        return { success: true };
    } catch (error: any) {
        console.error('Database error in createMoveOutNotice action:', error);
        return { error: 'Database error: Failed to submit notice.' };
    }
}
