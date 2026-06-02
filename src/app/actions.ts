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
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

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

async function verifyPayment(transactionRef: string) {
    // In a production environment, you would call Paystack's verify endpoint:
    // https://api.paystack.co/transaction/verify/:reference
    // For now, we simulate success since the transaction reached the client callback.
    console.log(`Verifying Paystack transaction ref: ${transactionRef}`);
    return { success: true };
}

export async function processPaymentAndAssign(data: unknown) {
    const parsedData = initiatePaymentSchema.safeParse(data);

    if (!parsedData.success) {
        return { error: 'Invalid payment data.' };
    }
    
    const { tenantId, rentalId, roomId, orgId, rentAmount, depositAmount, phone, email, transactionRef } = parsedData.data;

    const verification = await verifyPayment(transactionRef);
    if (!verification.success) {
        return { error: 'Payment verification failed. Please contact support.'}
    }

    let rentPaymentId;
    let depositPaymentId;
    try {
        // 1. Create payment records
        rentPaymentId = await createPayment({
            tenantId, rentalId, roomId, orgId, amount: rentAmount, type: 'Rent',
            status: 'Completed', transactionId: transactionRef, phone, email
        });

        if (depositAmount > 0) {
            depositPaymentId = await createPayment({
                tenantId, rentalId, roomId, orgId, amount: depositAmount, type: 'Deposit',
                status: 'Completed', transactionId: transactionRef, phone, email
            });
        }
        
        revalidatePath('/payments');
        revalidatePath('/clients');
    } catch (error) {
        console.error('Failed to create payment records:', error);
        return { error: 'Failed to record payments in the database.' };
    }
    
    // 2. Assign the room if it's an initial assignment (indicated by deposit)
    if (depositAmount > 0) {
        try {
            await dbAssignRoom({ tenantId, rentalId, roomId, orgId });
        } catch (error) {
            console.error(error);
            if (rentPaymentId) await updatePaymentStatus(rentPaymentId, 'Failed');
            if (depositPaymentId) await updatePaymentStatus(depositPaymentId, 'Failed');
            return { error: 'Payment successful, but room assignment failed.' };
        }
        // Use a flag for redirect or return success to let client handle it
        return { success: true, redirect: '/assignments?status=success' };
    } else {
        return { success: true };
    }
}

export async function renewSubscription(orgId: string) {
    if (!orgId) return { error: "Organization ID is required." };
    
    try {
        const orgRef = doc(db, 'organizations', orgId);
        const orgSnap = await getDoc(orgRef);
        
        if (!orgSnap.exists()) throw new Error("Org not found");

        const currentExpiry = new Date(orgSnap.data().subscriptionEndDate);
        const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
        newExpiry.setMonth(newExpiry.getMonth() + 1);

        await updateDoc(orgRef, {
            subscriptionStatus: 'active',
            subscriptionEndDate: newExpiry.toISOString()
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { error: "Failed to renew subscription." };
    }
}

export async function activateSubscription(orgId: string) {
    if (!orgId) return { error: "Organization ID is required." };
    try {
        const orgRef = doc(db, 'organizations', orgId);
        await updateDoc(orgRef, {
            subscriptionStatus: 'active',
            // Refresh expiry to 1 month from now
            subscriptionEndDate: new Date(Date.now() + 86400000 * 30).toISOString()
        });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { error: "Failed to activate subscription." };
    }
}

export async function createMaintenanceRequest(data: unknown) {
    const parsedData = createMaintenanceRequestSchema.safeParse(data);
    if (!parsedData.success) return { error: 'Invalid data.' };
    try {
        await dbCreateMaintenanceRequest(parsedData.data);
        revalidatePath('/clients/maintenance');
        return { success: true };
    } catch (error: any) {
        return { error: 'Database error: Failed to submit request.' };
    }
}

export async function createAnnouncement(data: unknown) {
    const parsedData = announcementSchema.safeParse(data);
    if (!parsedData.success) return { error: 'Invalid data.' };
    try {
        await dbCreateAnnouncement(parsedData.data as any);
        revalidatePath('/admin/announcements');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create announcement.' };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await dbDeleteAnnouncement(id);
        revalidatePath('/admin/announcements');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete announcement.' };
    }
}

export async function createComplaint(data: unknown) {
    const parsedData = createComplaintSchema.safeParse(data);
    if (!parsedData.success) return { error: 'Invalid data.' };
    try {
        await dbCreateComplaint(parsedData.data);
        revalidatePath('/clients/complaints');
        return { success: true };
    } catch (error: any) {
        return { error: 'Database error: Failed to submit complaint.' };
    }
}

export async function createMoveOutNotice(data: unknown) {
    const parsedData = createMoveOutNoticeSchema.safeParse(data);
    if (!parsedData.success) return { error: 'Invalid data.' };
    try {
        await dbCreateMoveOutNotice(parsedData.data);
        revalidatePath('/clients/move-out');
        return { success: true };
    } catch (error: any) {
        return { error: 'Database error: Failed to submit notice.' };
    }
}
