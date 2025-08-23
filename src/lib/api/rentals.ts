
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
    const batch = writeBatch(db);

    const rentalRef = doc(collection(db, 'rentals'));
    batch.set(rentalRef, {
        name: rentalData.name,
        location: rentalData.location,
        ownerName: rentalData.ownerName,
        ownerNumber: rentalData.ownerNumber,
    });
    
    rentalData.rooms.forEach(room => {
        const roomRef = doc(collection(db, `rentals/${rentalRef.id}/rooms`));
        batch.set(roomRef, {
            ...room,
            isOccupied: false
        });
    });

    await batch.commit();
    revalidatePath('/rentals');
    return { success: true, id: rentalRef.id };
}
