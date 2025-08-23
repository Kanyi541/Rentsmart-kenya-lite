
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, writeBatch, doc } from "firebase/firestore";
import type { Rental, Room } from "@/lib/types";
import { rentalSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type RentalData = z.infer<typeof rentalSchema>;

export async function getRentals(): Promise<Rental[]> {
    const rentalsCol = collection(db, 'rentals');
    const rentalSnapshot = await getDocs(rentalsCol);
    const rentalsList = rentalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rental));
    
    for (const rental of rentalsList) {
        const roomsCol = collection(db, `rentals/${rental.id}/rooms`);
        const roomsSnapshot = await getDocs(roomsCol);
        rental.rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
    }
    
    return rentalsList;
}

export async function addRental(rentalData: RentalData) {
    try {
        // 1. Add the main rental document
        const rentalCol = collection(db, 'rentals');
        const rentalDocRef = await addDoc(rentalCol, {
            name: rentalData.name,
            location: rentalData.location,
            ownerName: rentalData.ownerName,
            ownerNumber: rentalData.ownerNumber,
        });

        // 2. Create a batch to add all the rooms in a subcollection
        const batch = writeBatch(db);
        const roomsColRef = collection(db, `rentals/${rentalDocRef.id}/rooms`);

        rentalData.rooms.forEach(room => {
            const roomRef = doc(roomsColRef); // Create a new doc with auto-ID in the subcollection
            batch.set(roomRef, {
                ...room,
                isOccupied: false
            });
        });

        // 3. Commit the batch
        await batch.commit();

        revalidatePath('/rentals');
        revalidatePath('/'); // Revalidate dashboard stats as well
        return { success: true, id: rentalDocRef.id };

    } catch (error: any) {
        console.error("Error adding rental:", error);
        return { error: "Failed to add rental due to a database error." };
    }
}
