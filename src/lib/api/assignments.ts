
import { query } from '@/lib/db';
import { z } from 'zod';
import { assignmentSchema } from '../schemas';

type AssignmentData = z.infer<typeof assignmentSchema>;

export async function assignRoomToTenant(data: AssignmentData) {
    // First, create the assignment record
    const assignmentResult: any = await query(
        'INSERT INTO assignments (tenantId, rentalId, roomId) VALUES (?, ?, ?)',
        [data.tenantId, data.rentalId, data.roomId]
    );

    // Then, update the room's status to occupied
    await query('UPDATE rooms SET isOccupied = ? WHERE id = ?', [true, data.roomId]);

    return { id: assignmentResult.insertId };
}
