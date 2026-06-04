
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, writeBatch, doc, updateDoc, query, where } from "firebase/firestore";
import type { Rental, Room } from "@/lib/types";
import { rentalSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getOrSet } from "@/lib/cache";

type RentalData = z.infer<typeof rentalSchema>;

export async function getRentals(orgId: string): Promise<Rental[]> {
  // Use cache to avoid repeated Firestore reads.
  const cacheKey = `rentals:${orgId}`;
  return await getOrSet<Rental[]>(cacheKey, async () => {
    if (!orgId) return [];
    const rentalsCol = collection(db, 'rentals');
    const q = query(rentalsCol, where('orgId', '==', orgId));
    const rentalSnapshot = await getDocs(q);
    const rentalsList = rentalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rental));
    for (const rental of rentalsList) {
      const roomsCol = collection(db, `rentals/${rental.id}/rooms`);
      const roomsSnapshot = await getDocs(roomsCol);
      rental.rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
    }
    return rentalsList;
  }, 300); // 5‑minute TTL (best‑practice)
}

export async function addRental(rentalData: RentalData) {
    if (!rentalData.orgId) return { error: "Organization ID is missing." };
    try {
        const rentalCol = collection(db, 'rentals');
        const rentalDocRef = await addDoc(rentalCol, {
            orgId: rentalData.orgId,
            name: rentalData.name,
            location: rentalData.location,
            ownerName: rentalData.ownerName,
            ownerNumber: rentalData.ownerNumber,
        });

        const batch = writeBatch(db);
        const roomsColRef = collection(db, `rentals/${rentalDocRef.id}/rooms`);

        rentalData.rooms.forEach(room => {
            const roomRef = doc(roomsColRef);
            batch.set(roomRef, {
                ...room,
                isOccupied: false
            });
        });

        await batch.commit();

        revalidatePath('/rentals');
        return { success: true, id: rentalDocRef.id };

    } catch (error: any) {
        console.error("Error adding rental:", error);
        return { error: "Failed to add rental due to a database error." };
    }
}

export async function updateRental(rentalId: string, rentalData: RentalData) {
    try {
        const rentalRef = doc(db, 'rentals', rentalId);
        
        await updateDoc(rentalRef, {
            name: rentalData.name,
            location: rentalData.location,
            ownerName: rentalData.ownerName,
            ownerNumber: rentalData.ownerNumber,
        });

        const roomsColRef = collection(db, `rentals/${rentalId}/rooms`);
        const existingRoomsSnapshot = await getDocs(roomsColRef);
        const existingRoomIds = new Set(existingRoomsSnapshot.docs.map(d => d.id));

        const batch = writeBatch(db);

        rentalData.rooms.forEach(room => {
            if (!room.id) {
                const roomRef = doc(roomsColRef);
                batch.set(roomRef, {
                    ...room,
                    isOccupied: false
                });
            } else {
                 if (existingRoomIds.has(room.id)) {
                    const roomRef = doc(db, `rentals/${rentalId}/rooms`, room.id);
                    batch.update(roomRef, { 
                        roomNumber: room.roomNumber,
                        roomType: room.roomType,
                        rent: room.rent
                    });
                 }
            }
        });

        await batch.commit();

        revalidatePath('/rentals');
        return { success: true };

    } catch (error: any) {
        console.error("Error updating rental:", error);
        return { error: "Failed to update rental." };
    }
}
