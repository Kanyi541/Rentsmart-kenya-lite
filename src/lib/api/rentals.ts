
import { query } from '@/lib/db';
import type { Rental } from '@/lib/types';
import { z } from 'zod';
import { rentalSchema } from '../schemas';

type RentalData = z.infer<typeof rentalSchema>;

export async function getRentals(): Promise<Rental[]> {
    // The rentals table in Postgres has a rental_id column instead of rentalId
    const rentalsResult: any = await query('SELECT id, name, location, "ownerName", "ownerNumber" FROM rentals', []);
    
    const rentals = await Promise.all(rentalsResult.map(async (rental: any) => {
        const roomsResult: any = await query('SELECT * FROM rooms WHERE "rentalId" = $1', [rental.id]);
        return {
            ...rental,
            ownerName: rental.ownerName,
            ownerNumber: rental.ownerNumber,
            rooms: roomsResult.map((room: any) => ({
                ...room,
                isOccupied: room.isOccupied
            })),
        };
    }));

    return rentals as Rental[];
}

export async function addRental(rentalData: RentalData) {
    try {
        // Insert rental
        const rentalResult: any = await query(
        `INSERT INTO rentals (name, location, "ownerName", "ownerNumber") VALUES ($1, $2, $3, $4) RETURNING id`,
        [rentalData.name, rentalData.location, rentalData.ownerName, rentalData.ownerNumber]
        );

        const rentalId = rentalResult[0].id;

        // Insert rooms
        for (const room of rentalData.rooms) {
            await query(
                `INSERT INTO rooms ("rentalId", "roomNumber", "roomType", rent, "isOccupied") VALUES ($1, $2, $3, $4, $5)`,
                [rentalId, room.roomNumber, room.roomType, room.rent, room.isOccupied || false]
            );
        }

        return { success: true, id: rentalId };
    } catch (error: any) {
        console.error('Database error in addRental:', error);
        return { error: error.message };
    }
}
