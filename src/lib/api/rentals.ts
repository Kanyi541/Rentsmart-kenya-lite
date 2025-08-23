'use server'

// This file is currently not used due to mock data in rentals/page.tsx
// It remains for future database integration.

import { query } from '@/lib/db';
import { rentalSchema } from '@/lib/schemas';
import type { Rental, Room } from '@/lib/types';
import { revalidatePath } from 'next/cache';

async function getRoomsForRental(rentalId: number): Promise<Room[]> {
    const rooms = await query('SELECT * FROM rooms WHERE rental_id = ?', [rentalId]);
    return rooms as Room[];
}

export async function getRentals(): Promise<Rental[]> {
    const rentalsResult = await query('SELECT * FROM rentals ORDER BY id DESC', []) as any[];

    const rentals = await Promise.all(rentalsResult.map(async (rental) => {
        const rooms = await getRoomsForRental(rental.id);
        return { ...rental, rooms };
    }));
    
    return rentals as Rental[];
}


export async function addRental(data: Omit<Rental, 'id'>): Promise<Rental> {
    const validation = rentalSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.message);
    }

    const { name, location, ownerName, ownerNumber, rooms } = validation.data;
    
    const rentalResult: any = await query(
        'INSERT INTO rentals (name, location, ownerName, ownerNumber) VALUES (?, ?, ?, ?)',
        [name, location, ownerName, ownerNumber]
    );
    const rentalId = rentalResult.insertId;

    for(const room of rooms) {
        await query(
            'INSERT INTO rooms (rental_id, roomNumber, roomType, rent, isOccupied) VALUES (?, ?, ?, ?, ?)',
            [rentalId, room.roomNumber, room.roomType, room.rent, room.isOccupied]
        )
    }

    revalidatePath('/rentals');
    revalidatePath('/');

    return { id: rentalId, ...validation.data };
}

export async function assignRoomToTenant(roomId: string | number, tenantId: string | number) {
    await query(
        'UPDATE rooms SET isOccupied = ?, tenant_id = ? WHERE id = ?',
        [true, tenantId, roomId]
    );
    await query(
        'INSERT INTO assignments (tenant_id, room_id) VALUES (?, ?)',
        [tenantId, roomId]
    );

    revalidatePath('/assignments');
    revalidatePath('/rentals');
    revalidatePath('/');
}
