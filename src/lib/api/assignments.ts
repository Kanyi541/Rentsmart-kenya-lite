
'use server'

import { z } from 'zod';
import { assignmentSchema } from '../schemas';
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, runTransaction } from "firebase/firestore";
import { revalidatePath } from 'next/cache';

type AssignmentData = z.infer<typeof assignmentSchema>;

export async function assignRoomToTenant(data: AssignmentData) {
    
    const roomRef = doc(db, `rentals/${data.rentalId}/rooms/${data.roomId}`);
    
    await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists() || roomDoc.data().isOccupied) {
            throw new Error("Room is already occupied or does not exist.");
        }
        
        transaction.update(roomRef, { isOccupied: true });
        
        const assignmentRef = doc(collection(db, 'assignments'));
        transaction.set(assignmentRef, data);
    });

    revalidatePath('/assignments');
    revalidatePath('/');
    
    return { success: true };
}
