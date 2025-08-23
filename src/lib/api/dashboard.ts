
import { query } from '@/lib/db';

export async function getDashboardStats() {
    try {
        const totalRentalsResult: any = await query('SELECT COUNT(*) as count FROM rentals', []);
        const totalTenantsResult: any = await query('SELECT COUNT(*) as count FROM tenants', []);
        const totalRoomsResult: any = await query('SELECT COUNT(*) as count FROM rooms', []);
        const occupiedRoomsResult: any = await query('SELECT COUNT(*) as count FROM rooms WHERE "isOccupied" = $1', [true]);

        return {
            totalRentals: totalRentalsResult[0].count,
            totalTenants: totalTenantsResult[0].count,
            totalRooms: totalRoomsResult[0].count,
            occupiedRooms: occupiedRoomsResult[0].count,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Return zeroed stats on error to prevent page crash
        return {
            totalRentals: 0,
            totalTenants: 0,
            totalRooms: 0,
            occupiedRooms: 0,
        };
    }
}
