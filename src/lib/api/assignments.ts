
'use server'

import { z } from 'zod';
import { assignmentSchema } from '../schemas';
import { mockAssignments, mockRentals, mockTenants } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';

type AssignmentData = z.infer<typeof assignmentSchema>;

export async function assignRoomToTenant(data: AssignmentData) {
    const newId = new Date().getTime();
    
    mockAssignments.push({
        ...data,
        id: newId,
    });
    
    const rental = mockRentals.find(r => r.id.toString() === data.rentalId);
    if(rental) {
        const room = rental.rooms.find(room => room.id.toString() === data.roomId);
        if (room) {
            room.isOccupied = true;
        }
    }

    revalidatePath('/assignments');
    revalidatePath('/');
    
    return { id: newId };
}
