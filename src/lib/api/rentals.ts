
import { query } from '@/lib/db';
import type { Rental } from '@/lib/types';
import { z } from 'zod';
import { rentalSchema } from '../schemas';

type RentalData = z.infer<typeof rentalSchema>;

export async function getRentals(): Promise<Rental[]> {
    const rentalsResult: any = await query('SELECT * FROM rentals', []);
    
    const rentals = await Promise.all(rentalsResult.map(async (rental: any) => {
        const roomsResult: any = await query('SELECT * FROM rooms WHERE rentalId = ?', [rental.id]);
        return {
            ...rental,
            rooms: roomsResult,
        };
    }));

    return rentals as Rental[];
}

export async function addRental(rentalData: RentalData) {
    try {
        // Insert rental
        const rentalResult: any = await query(
        `INSERT INTO rentals (name, location, ownerName, ownerNumber) VALUES (?, ?, ?, ?)`,
        [rentalData.name, rentalData.location, rentalData.ownerName, rentalData.ownerNumber]
        );

        const rentalId = rentalResult.insertId;

        // Insert rooms
        for (const room of rentalData.rooms) {
            await query(
                `INSERT INTO rooms (rentalId, roomNumber, roomType, rent, isOccupied) VALUES (?, ?, ?, ?, ?)`,
                [rentalId, room.roomNumber, room.roomType, room.rent, room.isOccupied || false]
            );
        }

        return { success: true, id: rentalId };
    } catch (error: any) {
        console.error('Database error in addRental:', error);
        return { error: error.message };
    }
}
