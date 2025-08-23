
'use server'

import { mockRentals } from "@/lib/mock-data";
import type { Rental } from "@/lib/types";
import { rentalSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type RentalData = z.infer<typeof rentalSchema>;

export async function getRentals(): Promise<Rental[]> {
    // We wrap this in a promise to simulate async fetching
    return Promise.resolve(mockRentals);
}

export async function addRental(rentalData: RentalData) {
    const newId = new Date().getTime();

    const newRental: Rental = {
        ...rentalData,
        id: newId,
        rooms: rentalData.rooms.map((room, index) => ({
            ...room,
            id: `${newId}-${index}`,
            isOccupied: false,
        }))
    }

    mockRentals.push(newRental);
    revalidatePath('/rentals');
    return { success: true, id: newId };
}
