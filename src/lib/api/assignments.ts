
import { query } from '@/lib/db';
import { z } from 'zod';
import { assignmentSchema } from '../schemas';

type AssignmentData = z.infer<typeof assignmentSchema>;

export async function assignRoomToTenant(data: AssignmentData) {
    // First, create the assignment record
    const assignmentResult: any = await query(
        'INSERT INTO assignments ("tenantId", "rentalId", "roomId") VALUES ($1, $2, $3) RETURNING id',
        [data.tenantId, data.rentalId, data.roomId]
    );

    // Then, update the room's status to occupied
    await query('UPDATE rooms SET "isOccupied" = $1 WHERE id = $2', [true, data.roomId]);

    return { id: assignmentResult[0].id };
}
