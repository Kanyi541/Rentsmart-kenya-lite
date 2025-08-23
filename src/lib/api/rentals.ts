
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
    const rentalResult: any = await query(
        'INSERT INTO rentals (name, location, ownerName, ownerNumber) VALUES (?, ?, ?, ?)',
        [rentalData.name, rentalData.location, rentalData.ownerName, rentalData.ownerNumber]
    );

    const rentalId = rentalResult.insertId;

    const roomPromises = rentalData.rooms.map(room => {
        return query(
            'INSERT INTO rooms (rentalId, roomNumber, roomType, rent, isOccupied) VALUES (?, ?, ?, ?, ?)',
            [rentalId, room.roomNumber, room.roomType, room.rent, room.isOccupied]
        );
    });

    await Promise.all(roomPromises);

    return { id: rentalId };
}
